import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'src/common/logger-v2/logger.module';
import { MailProcessor } from './mail.processor';
import { MailService } from './mail.service';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    BullModule.registerQueueAsync({
      name: 'mail-queue',
      useFactory: async (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}
