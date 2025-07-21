import { Global, Module } from '@nestjs/common';
import { LoggerService } from 'src/common/logger-v2/logger.service';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService, LoggerService],
  exports: [PrismaService],
})
export class DatabaseModule {}
