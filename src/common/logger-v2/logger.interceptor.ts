import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from './logger.service';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const correlationId = (request.headers['x-correlation-id'] as string) || uuidv4();
    const requestId = uuidv4();
    const startTime = Date.now();

    // Set correlation ID header for response
    response.setHeader('x-correlation-id', correlationId);

    const logContext = {
      correlationId,
      requestId,
      userId: (request as any).user?.id,
      method: request.method,
      url: request.url,
      userAgent: request.get('user-agent'),
      ip: request.ip || request.connection.remoteAddress,
    };

    return this.logger.runWithContext(logContext, () => {
      this.logger.log(`Incoming ${request.method} ${request.url}`, 'HTTP');

      return next.handle().pipe(
        tap({
          next: () => {
            const responseTime = Date.now() - startTime;
            this.logger.logApiCall(request.method, request.url, response.statusCode, responseTime);
          },
          error: (error) => {
            const responseTime = Date.now() - startTime;
            this.logger.error(`Request failed: ${error.message}`, error.stack, 'HTTP', {
              method: request.method,
              url: request.url,
              statusCode: response.statusCode,
              responseTime,
            });
          },
        }),
      );
    });
  }
}
