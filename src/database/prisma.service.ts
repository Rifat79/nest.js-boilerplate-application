import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LoggerService } from 'src/common/logger-v2/logger.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly logger: LoggerService) {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
      ],
    });
  }

  async onModuleInit() {
    // Type assertion to bypass TypeScript issues
    const client = this as any;

    // Enable query logging in development
    if (process.env.NODE_ENV === 'development') {
      client.$on('query', (event: any) => {
        this.logger.logDatabaseQuery(event.query, event.duration, undefined);
        // console.log('Query: ' + event.query);
        // console.log('Params: ' + event.params);
        // console.log('Duration: ' + event.duration + 'ms');
      });
    }

    client.$on('error', (event: any) => {
      this.logger.error('Prisma Error', undefined, 'PrismaService', {
        target: event.target,
        message: event.message,
      });
    });

    // Connect to the database
    await this.$connect();
    this.logger.log('Connected to the database', 'PrismaService');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from the database', 'PrismaService');
  }
}
