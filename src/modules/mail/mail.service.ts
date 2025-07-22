import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { SendMailOptions } from 'nodemailer';

@Injectable()
export class MailService {
  constructor(@InjectQueue('mail-queue') private mailQueue: Queue) {}

  async sendMail(data: SendMailOptions & { template?: string; context?: any }) {
    await this.mailQueue.add('send-mail', data, {
      attempts: 3,
      backoff: 5000,
      removeOnComplete: true,
    });
  }
}

/* 

await this.mailService.sendMail({
  to: 'user@example.com',
  subject: 'Welcome!',
  template: 'welcome',
  context: {
    name: 'Rifat',
    company: 'Acme Corp',
  },
});


*/
