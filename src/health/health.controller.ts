import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get('ping')
  ping() {
    return { message: 'pong', timestamp: new Date().toISOString() };
  }

  @Get()
  check() {
    try {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3000,
        memory: process.memoryUsage(),
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }
}
