import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerInterceptor } from './common/logger-v2/logger.interceptor';
import { LoggerMiddleware } from './common/logger-v2/logger.middleware';
import { LoggerModule } from './common/logger-v2/logger.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { validate } from './config/env.validation';
import jwtConfig from './config/jwt.config';
import mailConfig from './config/mail.config';
import redisConfig from './config/redis.config';
import swaggerConfig from './config/swagger.config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { MailModule } from './modules/mail/mail.module';
import { UsersModule } from './modules/users/users.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      cache: true,
      load: [appConfig, redisConfig, jwtConfig, databaseConfig, swaggerConfig, mailConfig],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Caching
    CacheModule.register({
      isGlobal: true,
      ttl: 300, // 5 minutes default TTL
    }),

    // Scheduling
    ScheduleModule.forRoot(),

    // Core modules
    LoggerModule,
    DatabaseModule,
    HealthModule,

    // Feature modules
    AuthModule,
    UsersModule,

    // Caching modules
    RedisModule,

    // Mailer
    MailModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
