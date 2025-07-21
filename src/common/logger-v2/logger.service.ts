import { Injectable, LoggerService as NestLogger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AsyncLocalStorage } from 'async_hooks';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

export interface LogContext {
  correlationId?: string;
  userId?: string;
  requestId?: string;
  service?: string;
  method?: string;
  url?: string;
  userAgent?: string;
  ip?: string;
  [key: string]: any;
}

@Injectable()
export class LoggerService implements NestLogger {
  private readonly winston: winston.Logger;
  private readonly asyncLocalStorage = new AsyncLocalStorage<LogContext>();
  private readonly sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];

  constructor(private configService: ConfigService) {
    this.winston = this.createWinstonLogger();
  }

  private createWinstonLogger(): winston.Logger {
    const logLevel = this.configService.get('LOG_LEVEL', 'info');
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const serviceName = this.configService.get('SERVICE_NAME', 'nestjs-app');

    const format = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf((info) => {
        const context = this.asyncLocalStorage.getStore() || {};
        return JSON.stringify({
          timestamp: info.timestamp,
          level: info.level,
          message: info.message,
          service: serviceName,
          ...context,
          ...(info.stack && { stack: info.stack }),
          ...(typeof info.meta === 'object' && info.meta !== null ? info.meta : {}),
        });
      }),
    );

    const transports: winston.transport[] = [];

    // Console transport for development
    if (!isProduction) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
      );
    }

    // File transports with rotation
    const logDir = this.configService.get('LOG_DIR', './logs');

    // Combined logs
    transports.push(
      new DailyRotateFile({
        filename: `${logDir}/application-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        level: logLevel,
        format,
      }),
    );

    // Error logs
    transports.push(
      new DailyRotateFile({
        filename: `${logDir}/error-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '90d',
        level: 'error',
        format,
      }),
    );

    // Production console output as JSON
    if (isProduction) {
      transports.push(
        new winston.transports.Console({
          format,
          level: logLevel,
        }),
      );
    }

    return winston.createLogger({
      level: logLevel,
      format,
      transports,
      exitOnError: false,
    });
  }

  setContext(context: LogContext): void {
    this.asyncLocalStorage.enterWith(context);
  }

  runWithContext<T>(context: LogContext, callback: () => T): T {
    return this.asyncLocalStorage.run(context, callback);
  }

  private sanitizeData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeData(item));
    }

    const sanitized = { ...data };
    for (const [key, value] of Object.entries(sanitized)) {
      if (this.sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeData(value);
      }
    }
    return sanitized;
  }

  private formatMessage(message: any): string {
    if (typeof message === 'string') {
      return message;
    }
    return JSON.stringify(this.sanitizeData(message));
  }

  log(message: any, context?: string, meta?: any) {
    this.winston.info(this.formatMessage(message), {
      context,
      meta: this.sanitizeData(meta),
    });
  }

  error(message: any, trace?: string, context?: string, meta?: any) {
    this.winston.error(this.formatMessage(message), {
      context,
      stack: trace,
      meta: this.sanitizeData(meta),
    });
  }

  warn(message: any, context?: string, meta?: any) {
    this.winston.warn(this.formatMessage(message), {
      context,
      meta: this.sanitizeData(meta),
    });
  }

  debug(message: any, context?: string, meta?: any) {
    this.winston.debug(this.formatMessage(message), {
      context,
      meta: this.sanitizeData(meta),
    });
  }

  verbose(message: any, context?: string, meta?: any) {
    this.winston.verbose(this.formatMessage(message), {
      context,
      meta: this.sanitizeData(meta),
    });
  }

  // Business logic specific methods
  logUserAction(userId: string, action: string, details?: any) {
    this.log(`User action: ${action}`, 'UserAction', {
      userId,
      action,
      details: this.sanitizeData(details),
    });
  }

  logApiCall(method: string, url: string, statusCode: number, responseTime: number) {
    this.log(`API ${method} ${url}`, 'API', {
      method,
      url,
      statusCode,
      responseTime,
    });
  }

  logDatabaseQuery(query: string, executionTime: number, affectedRows?: number) {
    this.debug('Database query executed', 'Database', {
      query: query.length > 500 ? query.substring(0, 500) + '...' : query,
      executionTime,
      affectedRows,
    });
  }
}
