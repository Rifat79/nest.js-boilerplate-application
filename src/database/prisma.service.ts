import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
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
        console.log('Query: ' + event.query);
        console.log('Params: ' + event.params);
        console.log('Duration: ' + event.duration + 'ms');
      });
    }

    client.$on('error', (event: any) => {
      console.error('Prisma Error:', event);
    });

    // Connect to the database
    await this.$connect();
    console.log('Connected to the database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
