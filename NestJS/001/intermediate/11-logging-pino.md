# Question 31: How do you implement structured logging with Pino in NestJS?

## Answer

Pino is a fast JSON logger for Node.js. NestJS can be configured to use Pino for structured logging.

## Example:

```typescript
// Install: npm install nestjs-pino pino-http pino-pretty

// main.ts
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));
  app.flushLogs();

  await app.listen(3000);
}
bootstrap();

// app.module.ts
import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
            colorize: true,
          },
        },
        serializers: {
          req: (req) => ({
            id: req.id,
            method: req.method,
            url: req.url,
          }),
          res: (res) => ({
            statusCode: res.statusCode,
          }),
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// users.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(UsersController.name);
  }

  @Get()
  findAll() {
    this.logger.info('Finding all users');
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() createUserDto: any) {
    this.logger.info({ userData: createUserDto }, 'Creating user');
    return this.usersService.create(createUserDto);
  }
}

// users.service.ts
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class UsersService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(UsersService.name);
  }

  findAll() {
    this.logger.debug('Fetching all users');
    return [];
  }

  create(userData: any) {
    this.logger.info({ userId: userData.id }, 'User created');
    return userData;
  }

  async findOne(id: number) {
    this.logger.trace({ userId: id }, 'Finding user');
    try {
      // Some operation
      this.logger.info({ userId: id }, 'User found');
      return { id };
    } catch (error) {
      this.logger.error({ err: error, userId: id }, 'Error finding user');
      throw error;
    }
  }
}

// Custom logger service
// logger.service.ts
import { Injectable, LoggerService } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class MyLogger implements LoggerService {
  constructor(private readonly pinoLogger: PinoLogger) {}

  log(message: string, context?: string) {
    this.pinoLogger.info({ context }, message);
  }

  error(message: string, trace: string, context?: string) {
    this.pinoLogger.error({ context, trace }, message);
  }

  warn(message: string, context?: string) {
    this.pinoLogger.warn({ context }, message);
  }

  debug(message: string, context?: string) {
    this.pinoLogger.debug({ context }, message);
  }

  verbose(message: string, context?: string) {
    this.pinoLogger.trace({ context }, message);
  }
}

// Using in app.module.ts
import { Logger } from '@nestjs/common';
import { MyLogger } from './logger/logger.service';

@Module({
  providers: [MyLogger],
})
export class AppModule implements NestModule {
  constructor(private logger: MyLogger) {
    this.logger.setContext('AppModule');
  }

  configure(consumer: MiddlewareConsumer) {
    this.logger.log('Configuring middleware');
  }
}

// Environment-based configuration
// app.module.ts
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        pinoHttp: {
          level: configService.get('LOG_LEVEL', 'info'),
          transport:
            configService.get('NODE_ENV') === 'development'
              ? {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                  },
                }
              : undefined,
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```
