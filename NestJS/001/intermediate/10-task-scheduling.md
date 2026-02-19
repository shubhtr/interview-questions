# Question 30: How do you implement task scheduling in NestJS?

## Answer

NestJS provides `@nestjs/schedule` package for task scheduling using cron jobs, intervals, and timeouts.

## Example:

```typescript
// Install: npm install @nestjs/schedule
// Install: npm install -D @types/cron

// app.module.ts
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TasksModule,
  ],
})
export class AppModule {}

// tasks.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  // Cron job - every minute
  @Cron('45 * * * * *')
  handleCron() {
    this.logger.debug('Called every minute at 45 seconds');
  }

  // Using CronExpression enum
  @Cron(CronExpression.EVERY_5_SECONDS)
  handleEvery5Seconds() {
    this.logger.debug('Called every 5 seconds');
  }

  // Cron job - every day at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  handleDailyTask() {
    this.logger.debug('Called every day at midnight');
  }

  // Cron job - every week on Monday
  @Cron('0 0 * * 1')
  handleWeeklyTask() {
    this.logger.debug('Called every Monday at midnight');
  }

  // Cron job with timezone
  @Cron('0 0 * * *', {
    name: 'daily-report',
    timeZone: 'America/New_York',
  })
  handleDailyReport() {
    this.logger.debug('Daily report generated');
  }

  // Interval - every 10 seconds
  @Interval(10000)
  handleInterval() {
    this.logger.debug('Called every 10 seconds');
  }

  // Interval with name
  @Interval('cleanup', 60000)
  handleCleanup() {
    this.logger.debug('Cleanup task executed');
  }

  // Timeout - once after 5 seconds
  @Timeout(5000)
  handleTimeout() {
    this.logger.debug('Called once after 5 seconds');
  }

  // Timeout with name
  @Timeout('init', 2000)
  handleInit() {
    this.logger.log('Application initialized');
  }

  // Dynamic cron - can be enabled/disabled
  @Cron('0 0 * * *', {
    name: 'dynamic-task',
  })
  handleDynamicTask() {
    this.logger.debug('Dynamic task executed');
  }
}

// tasks.module.ts
import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Module({
  providers: [TasksService],
})
export class TasksModule {}

// Managing scheduled tasks dynamically
// tasks.service.ts (extended)
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class TasksService {
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  addCronJob(name: string, cronExpression: string) {
    const job = new CronJob(cronExpression, () => {
      this.logger.warn(`Job ${name} executing!`);
    });

    this.schedulerRegistry.addCronJob(name, job);
    job.start();

    this.logger.warn(`Job ${name} added!`);
  }

  deleteCronJob(name: string) {
    this.schedulerRegistry.deleteCronJob(name);
    this.logger.warn(`Job ${name} deleted!`);
  }

  getCronJobs() {
    const jobs = this.schedulerRegistry.getCronJobs();
    jobs.forEach((value, key) => {
      let next;
      try {
        next = value.nextDates().toDate();
      } catch (e) {
        next = 'error: next fire date is in the past!';
      }
      this.logger.log(`Job: ${key} -> next: ${next}`);
    });
  }

  addInterval(name: string, milliseconds: number) {
    const callback = () => {
      this.logger.warn(`Interval ${name} executing!`);
    };

    const interval = setInterval(callback, milliseconds);
    this.schedulerRegistry.addInterval(name, interval);
  }

  deleteInterval(name: string) {
    this.schedulerRegistry.deleteInterval(name);
    this.logger.warn(`Interval ${name} deleted!`);
  }

  addTimeout(name: string, milliseconds: number) {
    const callback = () => {
      this.logger.warn(`Timeout ${name} executing!`);
    };

    const timeout = setTimeout(callback, milliseconds);
    this.schedulerRegistry.addTimeout(name, timeout);
  }

  deleteTimeout(name: string) {
    this.schedulerRegistry.deleteTimeout(name);
    this.logger.warn(`Timeout ${name} deleted!`);
  }
}

// tasks.controller.ts
import { Controller, Post, Delete, Get, Body } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('cron')
  addCronJob(@Body() data: { name: string; cron: string }) {
    this.tasksService.addCronJob(data.name, data.cron);
    return { message: 'Cron job added' };
  }

  @Delete('cron/:name')
  deleteCronJob(@Param('name') name: string) {
    this.tasksService.deleteCronJob(name);
    return { message: 'Cron job deleted' };
  }

  @Get('cron')
  getCronJobs() {
    this.tasksService.getCronJobs();
    return { message: 'Check logs for cron jobs' };
  }
}
```
