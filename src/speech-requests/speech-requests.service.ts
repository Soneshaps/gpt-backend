import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../logger';

/**
 * Service responsible for handling speech request operations
 *
 * This service provides methods for creating and managing speech requests,
 * including validation of voice references and database operations.
 */
@Injectable()
export class SpeechRequestsService {
  private readonly logger: LoggerService;

  /**
   * Creates an instance of the SpeechRequestsService
   *
   * @param prisma - The Prisma service for database operations
   */
  constructor(private readonly prisma: PrismaService) {
    this.logger = new LoggerService().setContext('SpeechRequestsService');
  }

  /**
   * Creates a new speech request
   *
   * This method validates any provided voice ID, creates a new speech request
   * in the database, and returns the created entity with its voice relationship.
   *
   * @param data - The speech request data
   * @param data.prompt - The text prompt for speech generation
   * @param data.type - The type of speech request (e.g., 'text-to-speech', 'song')
   * @param data.lyrics - Optional lyrics for song generation
   * @param data.songMode - Optional song mode (lyrics or instrumental)
   * @param data.fileUrl - Optional URL to uploaded audio file
   * @param data.voiceId - Optional voice ID to use for speech generation
   * @returns The created speech request with its voice relationship (if any)
   * @throws Error if the provided voice ID doesn't exist
   */
  async create(data: {
    prompt: string;
    type: string;
    lyrics?: string;
    songMode?: string;
    fileUrl?: string;
    voiceId?: string;
  }) {
    try {
      this.logger.log(`Creating speech request: ${JSON.stringify(data)}`);

      // Validate voice ID if provided
      if (data.voiceId) {
        const voice = await this.prisma.voice.findUnique({
          where: { id: data.voiceId },
        });

        if (!voice) {
          this.logger.error(`Voice with ID ${data.voiceId} not found`);
          throw new Error(`Voice with ID ${data.voiceId} not found`);
        }
      }

      const speechRequest = await this.prisma.speechRequest.create({
        data: {
          prompt: data.prompt,
          type: data.type,
          lyrics: data.lyrics,
          songMode: data.songMode,
          fileUrl: data.fileUrl,
          voiceId: data.voiceId,
          status: 'pending',
        },
        include: {
          voice: true,
        },
      });

      this.logger.log(`Speech request created with ID: ${speechRequest.id}`);
      return speechRequest;
    } catch (error) {
      this.logger.error(`Error creating speech request: ${error.message}`);
      throw error;
    }
  }
}
