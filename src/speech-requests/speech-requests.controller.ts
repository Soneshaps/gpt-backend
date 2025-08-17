import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SpeechRequestsService } from './speech-requests.service';
import { LoggerService } from '../logger';
import { CreateSpeechRequestDto } from './dto/create-speech-request.dto';

/**
 * Controller responsible for handling speech request HTTP endpoints
 *
 * This controller provides endpoints for creating and managing speech requests,
 * which can be used for text-to-speech, song generation, and other speech synthesis tasks.
 */
@ApiTags('speech-requests')
@Controller('speech-requests')
export class SpeechRequestsController {
  private readonly logger: LoggerService;

  /**
   * Creates an instance of the SpeechRequestsController
   *
   * @param speechRequestsService - The service for handling speech request operations
   */
  constructor(private readonly speechRequestsService: SpeechRequestsService) {
    this.logger = new LoggerService().setContext('SpeechRequestsController');
  }

  /**
   * Creates a new speech request
   *
   * This endpoint allows clients to create a new speech request with:
   * - A text prompt for speech generation
   * - A type of speech request (text-to-speech, song, etc.)
   * - Optional lyrics for song generation
   * - Optional song mode (lyrics or instrumental)
   * - Optional file URL for uploaded audio files
   * - Optional voice ID to use for speech generation
   *
   * @param createSpeechRequestDto - The DTO containing speech request data
   * @returns The created speech request with its voice relationship (if any)
   * @throws BadRequestException if validation fails or voice ID doesn't exist
   */
  @Post()
  @ApiOperation({ summary: 'Create a new speech request' })
  @ApiBody({ type: CreateSpeechRequestDto })
  @ApiResponse({
    status: 201,
    description: 'The speech request has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(@Body() createSpeechRequestDto: CreateSpeechRequestDto) {
    try {
      this.logger.log(
        `Creating speech request: ${JSON.stringify(createSpeechRequestDto)}`,
      );
      return await this.speechRequestsService.create(createSpeechRequestDto);
    } catch (error) {
      this.logger.error(`Failed to create speech request: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }
}
