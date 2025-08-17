import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../logger';
import { RedisService } from '../redis';

/**
 * Service responsible for handling voice-related operations
 *
 * This service provides methods for retrieving voice data from the database
 * with optional filtering, searching, and pagination. It uses Redis caching to improve
 * performance for frequently accessed data.
 */
@Injectable()
export class VoicesService {
  private readonly logger: LoggerService;
  private readonly CACHE_TTL = 300; // 5 minutes in seconds
  private readonly CACHE_PREFIX = 'voices';

  /**
   * Creates an instance of the VoicesService
   *
   * @param prisma - The Prisma service for database operations
   * @param redisService - The Redis service for caching operations
   */
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {
    this.logger = new LoggerService().setContext('VoicesService');
  }

  /**
   * Retrieves all voices with pagination
   *
   * @param page - The page number (starting from 1)
   * @param limit - The number of items per page
   * @returns A paginated list of voices and pagination metadata
   */
  async findAll(page: number, limit: number) {
    // Create a cache key based on the query parameters
    const cacheKey = this.redisService.generateKey(this.CACHE_PREFIX, {
      page,
      limit,
    });

    // Try to get data from cache
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      this.logger.log(`Cache hit: ${cacheKey}`);
      return cachedData;
    }

    // Cache miss, get data from database
    this.logger.log(`Cache miss: ${cacheKey}`);
    const skip = (page - 1) * limit;

    try {
      const startTime = Date.now();
      const [voices, total] = await Promise.all([
        this.prisma.voice.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.voice.count(),
      ]);

      const result = {
        voices,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };

      // Cache the result
      await this.redisService.set(cacheKey, result, this.CACHE_TTL);

      this.logger.log(
        `DB query: ${Date.now() - startTime}ms, ${voices.length} voices`,
      );
      return result;
    } catch (error) {
      this.logger.error(`Error retrieving voices: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retrieves voices filtered by language with pagination
   *
   * @param language - The language to filter voices by
   * @param page - The page number (starting from 1)
   * @param limit - The number of items per page
   * @returns A paginated list of voices filtered by language and pagination metadata
   */
  async findByLanguage(language: string, page: number, limit: number) {
    // Create a cache key based on the query parameters
    const cacheKey = this.redisService.generateKey(this.CACHE_PREFIX, {
      language,
      page,
      limit,
    });

    // Try to get data from cache
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      this.logger.log(`Cache hit: ${cacheKey}`);
      return cachedData;
    }

    // Cache miss, get data from database
    this.logger.log(`Cache miss: ${cacheKey}`);
    const skip = (page - 1) * limit;

    try {
      const startTime = Date.now();
      const [voices, total] = await Promise.all([
        this.prisma.voice.findMany({
          where: { language },
          skip,
          take: limit,
          orderBy: { name: 'asc' },
        }),
        this.prisma.voice.count({
          where: { language },
        }),
      ]);

      const result = {
        voices,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };

      // Cache the result
      await this.redisService.set(cacheKey, result, this.CACHE_TTL);

      this.logger.log(
        `DB query: ${Date.now() - startTime}ms, ${voices.length} ${language} voices`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Error retrieving ${language} voices: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Searches voices by name with pagination and optional language filtering
   *
   * @param searchQuery - The search term to filter voices by name
   * @param language - Optional language to filter voices by
   * @param page - The page number (starting from 1)
   * @param limit - The number of items per page
   * @returns A paginated list of voices matching the search criteria and pagination metadata
   */
  async searchVoices(
    searchQuery: string,
    language?: string,
    page: number = 1,
    limit: number = 15,
  ) {
    // Create a cache key based on the query parameters
    const cacheKey = this.redisService.generateKey(this.CACHE_PREFIX, {
      search: searchQuery,
      language,
      page,
      limit,
    });

    // Try to get data from cache
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      this.logger.log(`Cache hit: ${cacheKey}`);
      return cachedData;
    }

    // Cache miss, get data from database
    this.logger.log(`Cache miss: ${cacheKey}`);
    const skip = (page - 1) * limit;

    try {
      const startTime = Date.now();

      // Build where clause based on search query and optional language
      const whereClause: any = {
        name: {
          contains: searchQuery,
          mode: 'insensitive', // Case-insensitive search
        },
      };

      // Add language filter if provided
      if (language) {
        whereClause.language = language;
      }

      // Execute query with search filter
      const [voices, total] = await Promise.all([
        this.prisma.voice.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { name: 'asc' },
        }),
        this.prisma.voice.count({
          where: whereClause,
        }),
      ]);

      const result = {
        voices,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };

      // Cache the result
      await this.redisService.set(cacheKey, result, this.CACHE_TTL);

      this.logger.log(
        `Search query: ${Date.now() - startTime}ms, found ${voices.length} voices matching "${searchQuery}"`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Error searching voices for "${searchQuery}": ${error.message}`,
      );
      throw error;
    }
  }
}
