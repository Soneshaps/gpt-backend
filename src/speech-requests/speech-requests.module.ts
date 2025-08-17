import { Module } from '@nestjs/common';
import { SpeechRequestsController } from './speech-requests.controller';
import { SpeechRequestsService } from './speech-requests.service';

@Module({
  controllers: [SpeechRequestsController],
  providers: [SpeechRequestsService],
  exports: [SpeechRequestsService],
})
export class SpeechRequestsModule {}
