import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { CacheController } from './cache.controller';

@Global()
@Module({
  controllers: [CacheController],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
