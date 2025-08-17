import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Successfully connected to database');
    } catch (error) {
      console.error('❌ Failed to connect to database:', error.message);
      // Don't crash the app, but log the error
      // The app can still start without database connection for health checks
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
