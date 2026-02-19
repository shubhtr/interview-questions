# Question 15: How do you manage configuration in NestJS? Explain ConfigModule.

## Answer

NestJS provides `@nestjs/config` package for managing configuration. It supports environment variables, configuration files, and validation.

## Example:

```typescript
// Install: npm install @nestjs/config

// .env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=admin
DATABASE_PASSWORD=secret
DATABASE_NAME=mydb
JWT_SECRET=my-secret-key
NODE_ENV=development
PORT=3000

// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make config available globally
      envFilePath: '.env', // Path to .env file
      expandVariables: true, // Expand variables in .env
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// database.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
}));

// jwt.config.ts
export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '1d',
}));

// app.module.ts with configuration namespaces
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig], // Load configuration namespaces
    }),
  ],
})
export class AppModule {}

// database.service.ts - Using ConfigService
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService {
  constructor(private configService: ConfigService) {
    const dbHost = this.configService.get<string>('DATABASE_HOST');
    const dbPort = this.configService.get<number>('DATABASE_PORT');
    console.log(`Connecting to ${dbHost}:${dbPort}`);
  }

  getConnectionString(): string {
    return `postgresql://${this.configService.get('DATABASE_USER')}:${this.configService.get('DATABASE_PASSWORD')}@${this.configService.get('DATABASE_HOST')}:${this.configService.get('DATABASE_PORT')}/${this.configService.get('DATABASE_NAME')}`;
  }

  // Using typed configuration
  getDatabaseConfig() {
    return this.configService.get('database');
  }

  // With default values
  getPort(): number {
    return this.configService.get<number>('PORT', 3000);
  }
}

// app.service.ts - Using ConfigService with injection
import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import databaseConfig from './config/database.config';

@Injectable()
export class AppService {
  constructor(
    @Inject(databaseConfig.KEY)
    private dbConfig: ConfigType<typeof databaseConfig>,
  ) {
    console.log('Database config:', this.dbConfig);
  }
}

// config.schema.ts - Validation
import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
});

// app.module.ts with validation
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
  ],
})
export class AppModule {}
```
