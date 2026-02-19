# Question 37: How do you create Custom Providers in NestJS? Explain different provider types.

## Answer

NestJS supports different types of providers: standard, value, factory, and class providers. Each serves different use cases.

## Example:

```typescript
// Standard Provider
@Module({
  providers: [UsersService],
})
export class UsersModule {}

// Value Provider
@Module({
  providers: [
    {
      provide: 'CONFIG',
      useValue: {
        apiKey: '12345',
        timeout: 5000,
      },
    },
  ],
})
export class ConfigModule {}

// Usage
@Injectable()
export class ApiService {
  constructor(@Inject('CONFIG') private config: any) {}
}

// Factory Provider
@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: (configService: ConfigService) => {
        return new DatabaseConnection({
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
        });
      },
      inject: [ConfigService],
    },
  ],
})
export class DatabaseModule {}

// Async Factory Provider
@Module({
  providers: [
    {
      provide: 'ASYNC_DATABASE_CONNECTION',
      useFactory: async (configService: ConfigService) => {
        const connection = await createConnection({
          host: configService.get('DB_HOST'),
        });
        return connection;
      },
      inject: [ConfigService],
    },
  ],
})
export class DatabaseModule {}

// Class Provider (Alias)
@Module({
  providers: [
    UsersService,
    {
      provide: 'UsersServiceAlias',
      useClass: UsersService,
    },
  ],
})
export class UsersModule {}

// Custom Provider with Interface
// user.repository.interface.ts
export interface IUserRepository {
  findAll(): Promise<User[]>;
  findOne(id: number): Promise<User>;
}

// user.repository.ts
@Injectable()
export class UserRepository implements IUserRepository {
  async findAll(): Promise<User[]> {
    return [];
  }

  async findOne(id: number): Promise<User> {
    return { id, name: 'John' };
  }
}

// users.module.ts
@Module({
  providers: [
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
  ],
})
export class UsersModule {}

// Conditional Provider
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

// Provider with Token
// tokens.ts
export const DATABASE_CONNECTION = Symbol('DATABASE_CONNECTION');
export const CACHE_SERVICE = Symbol('CACHE_SERVICE');

// database.module.ts
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: () => new DatabaseConnection(),
    },
  ],
})
export class DatabaseModule {}

// Usage
@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: DatabaseConnection,
  ) {}
}

// Provider with Scope
@Module({
  providers: [
    {
      provide: 'REQUEST_SCOPED_SERVICE',
      useFactory: () => new RequestScopedService(),
      scope: Scope.REQUEST,
    },
  ],
})
export class AppModule {}

// Provider with Optional Injection
@Injectable()
export class UsersService {
  constructor(
    @Optional() @Inject('OPTIONAL_SERVICE') private optionalService?: Service,
  ) {}
}
```
