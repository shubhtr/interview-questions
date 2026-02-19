# Question 14: What are Lifecycle Hooks in NestJS? Explain with examples.

## Answer

Lifecycle hooks are methods that get called at specific points in the application or component lifecycle. NestJS provides hooks for modules, providers, and the application itself.

## Application Lifecycle Events:

1. `onModuleInit` - Called once the module has been initialized
2. `onApplicationBootstrap` - Called once the application has fully started
3. `onModuleDestroy` - Called before the module is destroyed
4. `beforeApplicationShutdown` - Called before the application shuts down
5. `onApplicationShutdown` - Called when the application shuts down

## Example:

```typescript
// app.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  onModuleInit() {
    console.log('AppService initialized');
    // Initialize database connections, start background jobs, etc.
  }

  onModuleDestroy() {
    console.log('AppService destroyed');
    // Cleanup: close connections, stop background jobs, etc.
  }
}

// database.service.ts
import {
  Injectable,
  OnModuleInit,
  OnApplicationBootstrap,
  OnModuleDestroy,
  BeforeApplicationShutdown,
  OnApplicationShutdown,
} from '@nestjs/common';

@Injectable()
export class DatabaseService
  implements
    OnModuleInit,
    OnApplicationBootstrap,
    OnModuleDestroy,
    BeforeApplicationShutdown,
    OnApplicationShutdown
{
  private connection: any;

  onModuleInit() {
    console.log('DatabaseService: Module initialized');
    // Initialize connection pool
    this.connection = { status: 'connecting' };
  }

  onApplicationBootstrap() {
    console.log('DatabaseService: Application bootstrapped');
    // Connection is ready
    this.connection.status = 'connected';
  }

  onModuleDestroy() {
    console.log('DatabaseService: Module destroyed');
    // Cleanup before shutdown
  }

  beforeApplicationShutdown(signal?: string) {
    console.log(`DatabaseService: Application shutting down (signal: ${signal})`);
    // Graceful shutdown: stop accepting new connections
    this.connection.status = 'closing';
  }

  onApplicationShutdown(signal?: string) {
    console.log(`DatabaseService: Application shut down (signal: ${signal})`);
    // Final cleanup: close all connections
    this.connection = null;
  }
}

// app.module.ts
import {
  Module,
  OnModuleInit,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { AppService } from './app.service';
import { DatabaseService } from './database.service';

@Module({
  providers: [AppService, DatabaseService],
})
export class AppModule
  implements OnModuleInit, OnApplicationBootstrap, OnModuleDestroy
{
  constructor(
    private readonly appService: AppService,
    private readonly databaseService: DatabaseService,
  ) {}

  onModuleInit() {
    console.log('AppModule initialized');
  }

  onApplicationBootstrap() {
    console.log('AppModule bootstrapped');
  }

  onModuleDestroy() {
    console.log('AppModule destroyed');
  }
}

// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable graceful shutdown
  app.enableShutdownHooks();

  await app.listen(3000);
  console.log('Application is running on: http://localhost:3000');
}
bootstrap();
```
