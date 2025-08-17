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

    // Start the server
    await app.listen(3000);
    logger.log('🚀 Application is running on: http://localhost:3000');
    logger.log('📚 API Documentation available at: http://localhost:3000/api');
  } catch (error) {
    logger.error(`Error starting server: ${error.message}`, error.stack);
    process.exit(1);
  }
}

void bootstrap();