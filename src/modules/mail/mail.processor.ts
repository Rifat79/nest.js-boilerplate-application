import { Process, Processor } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import { Options, SentMessageInfo } from 'nodemailer/lib/smtp-transport';
import * as path from 'path';

@Processor('mail-queue')
export class MailProcessor {
  private transporter: nodemailer.Transporter<SentMessageInfo, Options>;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('mail.host'),
      port: this.config.get<number>('mail.port'),
      auth: {
        user: this.config.get('mail.user'),
        pass: this.config.get('mail.pass'),
      },
    });
  }

  @Process('send-mail')
  async handleSendMail(job: Job) {
    const { to, subject, html, template, context, ...rest } = job.data;

    let compiledHtml = html;

    if (template) {
      const filePath = path.join(__dirname, 'templates', `${template}.hbs`);
      const source = fs.readFileSync(filePath, 'utf8');
      const compiled = handlebars.compile(source);
      compiledHtml = compiled(context);
    }

    await this.transporter.sendMail({
      from: this.config.get('mail.from'),
      to,
      subject,
      html: compiledHtml,
      ...rest,
    });
  }
}
