import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggerService } from './logger';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

async function bootstrap() {
  // Create a logger instance
  const logger = new LoggerService().setContext('Bootstrap');
  
  // Log startup information
  logger.log('Starting MusicGPT Backend...');
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`Port: ${process.env.PORT || 3000}`);
  
  try {
    // Create the NestJS application with Winston logger
    const app = await NestFactory.create(AppModule, {
      logger: WinstonModule.createLogger({
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.ms(),
              winston.format.colorize({ all: true }),
              winston.format.printf(
                ({ context, level, timestamp, message }) => {
                  return `${timestamp} [${level}] [${context}]: ${message}`;
                },
              ),
            ),
          }),
        ],
      }),
    });

    // Enable validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Apply global response transformation
    app.useGlobalInterceptors(new TransformInterceptor());
    logger.log('Response transformation enabled');

    // Enable CORS
    app.enableCors();
    logger.log('CORS enabled');

    // Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('MusicGPT API')
      .setDescription('The MusicGPT API description')
      .setVersion('1.0')
      .addTag('voices', 'Voice management endpoints')
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    logger.log('Swagger documentation initialized');

    // Get port from environment variable or default to 3000
    const port = process.env.PORT || 3000;
    
    // Start the server
    await app.listen(port, '0.0.0.0');
    logger.log(`🚀 Application is running on: http://0.0.0.0:${port}`);
    logger.log(`📚 API Documentation available at: http://0.0.0.0:${port}/api`);
    
    // Graceful shutdown handling
    process.on('SIGTERM', async () => {
      logger.log('SIGTERM received, shutting down gracefully...');
      await app.close();
      process.exit(0);
    });
    
    process.on('SIGINT', async () => {
      logger.log('SIGINT received, shutting down gracefully...');
      await app.close();
      process.exit(0);
    });
    
  } catch (error) {
    logger.error(`Error starting server: ${error.message}`, error.stack);
    logger.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

void bootstrap();