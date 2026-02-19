# Question 36: How do you create and use Dynamic Modules in NestJS?

## Answer

Dynamic modules allow you to configure modules at runtime. They're useful for creating reusable, configurable modules.

## Example:

```typescript
// database.module.ts - Dynamic Module
import { Module, DynamicModule } from '@nestjs/common';
import { DatabaseService } from './database.service';

export interface DatabaseModuleOptions {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

@Module({})
export class DatabaseModule {
  static forRoot(options: DatabaseModuleOptions): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: 'DATABASE_OPTIONS',
          useValue: options,
        },
        DatabaseService,
      ],
      exports: [DatabaseService],
      global: true, // Make it globally available
    };
  }

  static forRootAsync(options: {
    imports?: any[];
    useFactory?: (...args: any[]) => Promise<DatabaseModuleOptions> | DatabaseModuleOptions;
    inject?: any[];
  }): DynamicModule {
    return {
      module: DatabaseModule,
      imports: options.imports || [],
      providers: [
        {
          provide: 'DATABASE_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        DatabaseService,
      ],
      exports: [DatabaseService],
      global: true,
    };
  }
}

// database.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { DatabaseModuleOptions } from './database.module';

@Injectable()
export class DatabaseService {
  constructor(
    @Inject('DATABASE_OPTIONS')
    private options: DatabaseModuleOptions,
  ) {
    console.log('Database configured:', this.options);
  }

  getConnectionString(): string {
    return `postgresql://${this.options.username}:${this.options.password}@${this.options.host}:${this.options.port}/${this.options.database}`;
  }
}

// app.module.ts - Using dynamic module
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // Synchronous configuration
    DatabaseModule.forRoot({
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'secret',
      database: 'mydb',
    }),

    // Or async configuration
    DatabaseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}

// Another example: Logger Module
// logger.module.ts
import { Module, DynamicModule, Global } from '@nestjs/common';
import { LoggerService } from './logger.service';

export interface LoggerOptions {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
}

@Global()
@Module({})
export class LoggerModule {
  static forRoot(options: LoggerOptions): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        {
          provide: 'LOGGER_OPTIONS',
          useValue: options,
        },
        LoggerService,
      ],
      exports: [LoggerService],
    };
  }
}
```
