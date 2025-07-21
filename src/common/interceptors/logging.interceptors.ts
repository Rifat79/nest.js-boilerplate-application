import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../logger-v2/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params } = request;
    const userAgent = request.get('user-agent') || '';
    const ip = request.ip;

    const now = Date.now();

    // Optionally store context for downstream logging
    this.logger.setContext({
      method,
      url,
      userAgent,
      ip,
    });

    this.logger.log(`Incoming Request: ${method} ${url}`, 'RequestLog', {
      method,
      url,
      query,
      params,
      body,
      userAgent,
      ip,
    });

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        const contentLength = response.get('content-length');

        const responseTime = Date.now() - now;

        this.logger.logApiCall(method, url, statusCode, responseTime);
      }),
    );
  }
}
