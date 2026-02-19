# Question 25: How do you implement job queues with Bull in NestJS?

## Answer

Bull is a Redis-based queue for handling distributed jobs and messages. NestJS provides `@nestjs/bull` for integration.

## Example:

```typescript
// Install: npm install @nestjs/bull bull
// Install: npm install -D @types/bull

// app.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    EmailModule,
  ],
})
export class AppModule {}

// email.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EmailProcessor } from './email.processor';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  providers: [EmailProcessor, EmailService],
  controllers: [EmailController],
})
export class EmailModule {}

// email.processor.ts
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

interface EmailJob {
  to: string;
  subject: string;
  body: string;
}

@Processor('email')
export class EmailProcessor {
  @Process('send')
  async handleSendEmail(job: Job<EmailJob>) {
    const { to, subject, body } = job.data;
    
    console.log(`Sending email to ${to}...`);
    
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`Email sent to ${to}`);
    
    return { success: true, to, subject };
  }

  @Process('bulk-send')
  async handleBulkSend(job: Job<EmailJob[]>) {
    const emails = job.data;
    
    for (const email of emails) {
      await this.handleSendEmail({ data: email } as Job<EmailJob>);
    }
    
    return { success: true, count: emails.length };
  }
}

// email.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class EmailService {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async sendEmail(to: string, subject: string, body: string) {
    await this.emailQueue.add('send', {
      to,
      subject,
      body,
    });
  }

  async sendEmailWithOptions(
    to: string,
    subject: string,
    body: string,
    options: any,
  ) {
    await this.emailQueue.add(
      'send',
      { to, subject, body },
      {
        delay: options.delay || 0,
        attempts: options.attempts || 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }

  async sendBulkEmails(emails: Array<{ to: string; subject: string; body: string }>) {
    await this.emailQueue.add('bulk-send', emails);
  }

  async getJobStatus(jobId: string) {
    const job = await this.emailQueue.getJob(jobId);
    if (!job) {
      return null;
    }

    return {
      id: job.id,
      state: await job.getState(),
      progress: job.progress(),
      data: job.data,
      result: job.returnvalue,
      failedReason: job.failedReason,
    };
  }
}

// email.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  async sendEmail(@Body() emailData: { to: string; subject: string; body: string }) {
    await this.emailService.sendEmail(
      emailData.to,
      emailData.subject,
      emailData.body,
    );
    return { message: 'Email queued successfully' };
  }

  @Get('status/:jobId')
  async getStatus(@Param('jobId') jobId: string) {
    return this.emailService.getJobStatus(jobId);
  }
}

// Event listeners
// email.processor.ts (extended)
import { OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';

@Processor('email')
export class EmailProcessor {
  @OnQueueActive()
  onActive(job: Job) {
    console.log(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    console.log(`Job ${job.id} completed with result:`, result);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    console.error(`Job ${job.id} failed:`, error);
  }
}
```
