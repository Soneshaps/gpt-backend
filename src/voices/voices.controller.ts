import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { VoicesService } from './voices.service';
import { LoggerService } from '../logger';

/**
 * Controller responsible for handling voice-related HTTP requests
 *
 * This controller provides endpoints for retrieving voice data with
 * optional filtering by language, searching by name, and pagination support.
 */
@ApiTags('voices')
@Controller('voices')
export class VoicesController {
  private readonly logger: LoggerService;

  /**
   * Creates an instance of the VoicesController
   *
   * @param voicesService - The service for handling voice operations
   */
  constructor(private readonly voicesService: VoicesService) {
    this.logger = new LoggerService().setContext('VoicesController');
  }

  /**
   * Retrieves voices with optional filtering and pagination
   *
   * This endpoint allows clients to fetch voices with the following options:
   * - Filter by language (e.g., 'english', 'nepali', 'indian')
   * - Paginate results with page number and limit
   *
   * @param language - Optional language filter
   * @param page - Optional page number (default: 1)
   * @param limit - Optional items per page (default: 15, max: 100)
   * @returns Paginated list of voices and pagination metadata
   */
  @Get()
  @ApiOperation({ summary: 'Get voices with pagination and filtering' })
  @ApiQuery({
    name: 'language',
    required: false,
    description: 'Filter by language',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    type: Number,
  })
  findAll(
    @Query('language') language?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    this.logger.log(
      `Fetching voices with params: language=${language}, page=${page}, limit=${limit}`,
    );

    // Default values
    const pageNum = page ? +page : 1;
    const limitNum = limit ? +limit : 15;

    // Validate and apply limits
    const validPage = Math.max(1, pageNum);
    const validLimit = Math.min(100, Math.max(1, limitNum));

    this.logger.debug(
      `Using validated pagination: page=${validPage}, limit=${validLimit}`,
    );

    try {
      if (language) {
        this.logger.log(`Filtering voices by language: ${language}`);
        return this.voicesService.findByLanguage(
          language,
          validPage,
          validLimit,
        );
      }

      this.logger.log('Fetching all voices');
      return this.voicesService.findAll(validPage, validLimit);
    } catch (error) {
      this.logger.error(
        `Failed to fetch voices: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Searches voices by name with optional language filtering and pagination
   *
   * This endpoint allows clients to search for voices by name with the following options:
   * - Search query for voice name (case-insensitive)
   * - Optional filter by language (e.g., 'english', 'nepali', 'indian')
   * - Paginate results with page number and limit
   *
   * @param query - The search query for voice names
   * @param language - Optional language filter
   * @param page - Optional page number (default: 1)
   * @param limit - Optional items per page (default: 15, max: 100)
   * @returns Paginated list of matching voices and pagination metadata
   */
  @Get('search')
  @ApiOperation({
    summary: 'Search voices by name with pagination and filtering',
  })
  @ApiQuery({
    name: 'query',
    required: true,
    description: 'Search term for voice names',
  })
  @ApiQuery({
    name: 'language',
    required: false,
    description: 'Filter by language',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    type: Number,
  })
  searchVoices(
    @Query('query') query: string,
    @Query('language') language?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    this.logger.log(
      `Searching voices with query: "${query}", language=${language}, page=${page}, limit=${limit}`,
    );

    if (!query || query.trim() === '') {
      this.logger.warn('Empty search query provided');
      return {
        voices: [],
        pagination: { total: 0, page: 1, limit: 15, pages: 0 },
      };
    }

    // Default values
    const pageNum = page ? +page : 1;
    const limitNum = limit ? +limit : 15;

    // Validate and apply limits
    const validPage = Math.max(1, pageNum);
    const validLimit = Math.min(100, Math.max(1, limitNum));

    this.logger.debug(
      `Using validated pagination: page=${validPage}, limit=${validLimit}`,
    );

    try {
      return this.voicesService.searchVoices(
        query,
        language,
        validPage,
        validLimit,
      );
    } catch (error) {
      this.logger.error(
        `Failed to search voices: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
