# Question 29: What are Global Modules in NestJS? How do you create them?

## Answer

Global modules make their providers available to all modules without needing to import them. Use `@Global()` decorator.

## Example:

```typescript
// logger.module.ts - Global Module
import { Module, Global } from '@nestjs/common';
import { LoggerService } from './logger.service';

@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}

// app.module.ts
import { Module } from '@nestjs/common';
import { LoggerModule } from './logger/logger.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [LoggerModule, UsersModule],
})
export class AppModule {}

// users.module.ts - No need to import LoggerModule
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

// users.service.ts - Can use LoggerService directly
import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class UsersService {
  constructor(private logger: LoggerService) {} // Available globally

  findAll() {
    this.logger.log('Finding all users');
    return [];
  }
}

// config.module.ts - Another global module example
import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [NestConfigModule.forRoot()],
  exports: [NestConfigModule],
})
export class ConfigModule {}
```
