import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { VoicesModule } from './voices/voices.module';
import { LoggerModule } from './logger';
import { RedisModule } from './redis';
import { SpeechRequestsModule } from './speech-requests';
import { HealthModule } from './health';

@Module({
  imports: [
    RedisModule,
    PrismaModule,
    VoicesModule,
    LoggerModule,
    SpeechRequestsModule,
    HealthModule,
  ],
})
export class AppModule {}
