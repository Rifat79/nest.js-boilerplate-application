import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoggerService extends Logger {
  constructor(private configService: ConfigService) {
    super();
  }

  log(message: string, context?: string) {
    super.log(message, context);
  }

  error(message: string, trace?: string, context?: string) {
    super.error(message, trace, context);
  }

  warn(message: string, context?: string) {
    super.warn(message, context);
  }

  debug(message: string, context?: string) {
    if (this.configService.get('NODE_ENV') !== 'production') {
      super.debug(message, context);
    }
  }

  verbose(message: string, context?: string) {
    if (this.configService.get('NODE_ENV') !== 'production') {
      super.verbose(message, context);
    }
  }
}
