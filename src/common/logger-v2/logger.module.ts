import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerInterceptor } from './logger.interceptor';
import { LoggerService } from './logger.service';

@Module({
  imports: [ConfigModule],
  providers: [LoggerService, LoggerInterceptor],
  exports: [LoggerService, LoggerInterceptor],
})
export class LoggerModule {}
