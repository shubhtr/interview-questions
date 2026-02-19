# Question 39: How do you use factory providers in NestJS?

## Answer

Factory providers use `useFactory` to create provider instances dynamically. They can be synchronous or asynchronous and can inject other providers.

## Example:

```typescript
// Synchronous factory
@Module({
  providers: [
    {
      provide: 'CONFIG',
      useFactory: () => {
        return {
          apiUrl: process.env.API_URL || 'http://localhost:3000',
          timeout: 5000,
        };
      },
    },
  ],
})
export class ConfigModule {}

// Factory with dependencies
@Module({
  providers: [
    ConfigService,
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: (configService: ConfigService) => {
        return new DatabaseConnection({
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USER'),
          password: configService.get('DB_PASSWORD'),
        });
      },
      inject: [ConfigService], // Dependencies to inject
    },
  ],
})
export class DatabaseModule {}

// Async factory
@Module({
  providers: [
    {
      provide: 'ASYNC_DATABASE_CONNECTION',
      useFactory: async (configService: ConfigService) => {
        const connection = await createConnection({
          host: configService.get('DB_HOST'),
        });
        await connection.connect();
        return connection;
      },
      inject: [ConfigService],
    },
  ],
})
export class DatabaseModule {}

// Factory with multiple dependencies
@Module({
  providers: [
    LoggerService,
    ConfigService,
    {
      provide: 'COMPLEX_SERVICE',
      useFactory: (
        logger: LoggerService,
        config: ConfigService,
      ) => {
        logger.log('Creating complex service');
        return new ComplexService({
          logger,
          config: config.get('SERVICE_CONFIG'),
        });
      },
      inject: [LoggerService, ConfigService],
    },
  ],
})
export class ComplexModule {}

// Conditional factory
@Module({
  providers: [
    {
      provide: 'CACHE_SERVICE',
      useFactory: (configService: ConfigService) => {
        const cacheType = configService.get('CACHE_TYPE', 'memory');
        
        if (cacheType === 'redis') {
          return new RedisCacheService();
        }
        return new MemoryCacheService();
      },
      inject: [ConfigService],
    },
  ],
})
export class CacheModule {}

// Factory with error handling
@Module({
  providers: [
    {
      provide: 'SERVICE',
      useFactory: async (configService: ConfigService) => {
        try {
          const service = await createService(configService.get('SERVICE_URL'));
          return service;
        } catch (error) {
          console.error('Failed to create service:', error);
          return new FallbackService();
        }
      },
      inject: [ConfigService],
    },
  ],
})
export class ServiceModule {}
```
