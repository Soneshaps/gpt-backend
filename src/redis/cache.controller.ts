import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RedisService } from './redis.service';
import { LoggerService } from '../logger';

@ApiTags('cache')
@Controller('cache')
export class CacheController {
  private readonly logger: LoggerService;

  constructor(private readonly redisService: RedisService) {
    this.logger = new LoggerService().setContext('CacheController');
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear all cache' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Cache cleared successfully',
  })
  async clearCache() {
    this.logger.warn('Clearing cache');
    await this.redisService.flushAll();
  }
}
