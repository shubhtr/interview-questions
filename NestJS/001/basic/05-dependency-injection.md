# Question 5: Explain Dependency Injection in NestJS with examples.

## Answer

Dependency Injection (DI) is a design pattern where dependencies are provided to a class rather than the class creating them itself. NestJS has a built-in DI container that manages dependencies.

## How it works:

1. Mark a class as injectable with `@Injectable()`
2. Declare dependencies in the constructor
3. NestJS automatically resolves and injects dependencies

## Example:

```typescript
// logger.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class LoggerService {
  log(message: string) {
    console.log(`[LOG] ${new Date().toISOString()} - ${message}`);
  }

  error(message: string) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
  }
}

// email.service.ts
import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';

@Injectable()
export class EmailService {
  constructor(private readonly logger: LoggerService) {}

  sendEmail(to: string, subject: string, body: string) {
    this.logger.log(`Sending email to ${to}`);
    // Email sending logic
    return { success: true, to, subject };
  }
}

// users.service.ts
import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { EmailService } from './email.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly logger: LoggerService,
    private readonly emailService: EmailService,
  ) {}

  createUser(userData: any) {
    this.logger.log('Creating new user');
    // User creation logic
    const user = { id: 1, ...userData };
    
    // Send welcome email
    this.emailService.sendEmail(
      user.email,
      'Welcome!',
      'Welcome to our platform',
    );
    
    return user;
  }
}

// app.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { EmailService } from './email.service';
import { LoggerService } from './logger.service';

@Module({
  providers: [UsersService, EmailService, LoggerService],
})
export class AppModule {}
```
