# Question 35: How do you create conditional providers based on environment or configuration?

## Answer

You can use factory providers with conditions to provide different implementations based on environment variables or configuration.

## Example:

```typescript
// database.module.ts
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    {
      provide: 'DATABASE_SERVICE',
      useFactory: (configService: ConfigService) => {
        const dbType = configService.get('DATABASE_TYPE', 'postgres');
        
        if (dbType === 'postgres') {
          return new PostgresDatabaseService();
        } else if (dbType === 'mysql') {
          return new MysqlDatabaseService();
        } else {
          return new SqliteDatabaseService();
        }
      },
      inject: [ConfigService],
    },
  ],
})
export class DatabaseModule {}

// cache.module.ts
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    {
      provide: 'CACHE_SERVICE',
      useFactory: (configService: ConfigService) => {
        const cacheType = configService.get('CACHE_TYPE', 'memory');
        const nodeEnv = configService.get('NODE_ENV');
        
        if (cacheType === 'redis' && nodeEnv === 'production') {
          return new RedisCacheService();
        }
        return new MemoryCacheService();
      },
      inject: [ConfigService],
    },
  ],
})
export class CacheModule {}

// logger.module.ts
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    {
      provide: 'LOGGER_SERVICE',
      useFactory: (configService: ConfigService) => {
        const logLevel = configService.get('LOG_LEVEL', 'info');
        const nodeEnv = configService.get('NODE_ENV');
        
        if (nodeEnv === 'production') {
          return new ProductionLoggerService(logLevel);
        }
        return new DevelopmentLoggerService(logLevel);
      },
      inject: [ConfigService],
    },
  ],
})
export class LoggerModule {}

// Conditional module imports
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UsersModule,
    // Conditional module import
    ...(process.env.ENABLE_ADMIN === 'true' ? [AdminModule] : []),
    ...(process.env.ENABLE_ANALYTICS === 'true' ? [AnalyticsModule] : []),
  ],
})
export class AppModule {}

// Using async factory for conditional providers
@Module({
  providers: [
    {
      provide: 'FEATURE_SERVICE',
      useFactory: async (configService: ConfigService) => {
        const featureEnabled = await configService.get('FEATURE_ENABLED');
        
        if (featureEnabled === 'true') {
          return new FeatureService();
        }
        return new NoOpFeatureService();
      },
      inject: [ConfigService],
    },
  ],
})
export class FeatureModule {}
```
