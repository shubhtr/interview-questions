# Question 40: How do you use value providers in NestJS?

## Answer

Value providers use `useValue` to provide a constant value or pre-created instance. Useful for configuration, constants, or mock objects.

## Example:

```typescript
// Configuration values
@Module({
  providers: [
    {
      provide: 'API_KEY',
      useValue: 'secret-api-key-123',
    },
    {
      provide: 'API_URL',
      useValue: 'https://api.example.com',
    },
    {
      provide: 'TIMEOUT',
      useValue: 5000,
    },
  ],
})
export class ConfigModule {}

// Injecting values
@Injectable()
export class ApiService {
  constructor(
    @Inject('API_KEY') private apiKey: string,
    @Inject('API_URL') private apiUrl: string,
    @Inject('TIMEOUT') private timeout: number,
  ) {}
}

// Pre-created instances
const databaseConnection = new DatabaseConnection({
  host: 'localhost',
  port: 5432,
});

@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useValue: databaseConnection,
    },
  ],
})
export class DatabaseModule {}

// Constants object
const APP_CONFIG = {
  name: 'My App',
  version: '1.0.0',
  environment: process.env.NODE_ENV,
  features: {
    analytics: true,
    caching: true,
  },
};

@Module({
  providers: [
    {
      provide: 'APP_CONFIG',
      useValue: APP_CONFIG,
    },
  ],
})
export class AppModule {}

// Mock objects for testing
const mockUserService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
};

@Module({
  providers: [
    {
      provide: UsersService,
      useValue: mockUserService,
    },
  ],
})
export class TestModule {}

// Environment-based values
@Module({
  providers: [
    {
      provide: 'NODE_ENV',
      useValue: process.env.NODE_ENV || 'development',
    },
    {
      provide: 'IS_PRODUCTION',
      useValue: process.env.NODE_ENV === 'production',
    },
  ],
})
export class EnvironmentModule {}

// Complex value objects
const FEATURE_FLAGS = {
  ENABLE_BETA: process.env.ENABLE_BETA === 'true',
  ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === 'true',
  ENABLE_CACHING: process.env.ENABLE_CACHING === 'true',
};

@Module({
  providers: [
    {
      provide: 'FEATURE_FLAGS',
      useValue: FEATURE_FLAGS,
    },
  ],
})
export class FeatureFlagsModule {}
```
