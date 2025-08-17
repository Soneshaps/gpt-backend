import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import { createLogger, format, transports, Logger } from 'winston';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private context?: string;
  private logger: Logger;

  constructor() {
    this.logger = createLogger({
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json(),
      ),
      defaultMeta: { service: 'musicgpt-api' },
      transports: [
        // Write all logs with level `error` and below to `error.log`
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        // Write all logs with level `info` and below to `combined.log`
        new transports.File({ filename: 'logs/combined.log' }),
      ],
    });

    // If we're not in production, also log to the console with colorized output
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.printf(({ timestamp, level, message, context, ...meta }) => {
              return `${timestamp} [${level}] [${
                context || this.context || 'Global'
              }] ${message} ${
                Object.keys(meta).length ? JSON.stringify(meta) : ''
              }`;
            }),
          ),
        }),
      );
    }
  }

  setContext(context: string) {
    this.context = context;
    return this;
  }

  log(message: string, context?: string, ...meta: any[]) {
    this.logger.info(message, { context: context || this.context, ...meta });
  }

  error(message: string, trace?: string, context?: string, ...meta: any[]) {
    this.logger.error(message, {
      trace,
      context: context || this.context,
      ...meta,
    });
  }

  warn(message: string, context?: string, ...meta: any[]) {
    this.logger.warn(message, { context: context || this.context, ...meta });
  }

  debug(message: string, context?: string, ...meta: any[]) {
    this.logger.debug(message, { context: context || this.context, ...meta });
  }

  verbose(message: string, context?: string, ...meta: any[]) {
    this.logger.verbose(message, { context: context || this.context, ...meta });
  }
}
