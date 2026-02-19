# Question 38: What are provider tokens in NestJS? Explain string, symbol, and class tokens.

## Answer

Provider tokens identify providers in the DI container. They can be strings, symbols, or classes.

## Example:

```typescript
// String tokens
@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION', // String token
      useValue: { host: 'localhost', port: 5432 },
    },
    {
      provide: 'API_KEY', // String token
      useValue: 'secret-key',
    },
  ],
})
export class AppModule {}

// Injecting with string token
@Injectable()
export class UsersService {
  constructor(
    @Inject('DATABASE_CONNECTION') private db: any,
    @Inject('API_KEY') private apiKey: string,
  ) {}
}

// Symbol tokens (better for avoiding collisions)
// tokens.ts
export const DATABASE_CONNECTION = Symbol('DATABASE_CONNECTION');
export const CACHE_SERVICE = Symbol('CACHE_SERVICE');
export const LOGGER_SERVICE = Symbol('LOGGER_SERVICE');

// app.module.ts
import { DATABASE_CONNECTION, CACHE_SERVICE } from './tokens';

@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION, // Symbol token
      useClass: DatabaseService,
    },
    {
      provide: CACHE_SERVICE,
      useClass: CacheService,
    },
  ],
})
export class AppModule {}

// Injecting with symbol token
import { DATABASE_CONNECTION } from './tokens';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: DatabaseService,
  ) {}
}

// Class tokens (most common)
@Module({
  providers: [UsersService, DatabaseService], // Class as token
})
export class UsersModule {}

// Injecting with class token (no @Inject needed)
@Injectable()
export class PostsService {
  constructor(
    private usersService: UsersService, // Class token
    private db: DatabaseService, // Class token
  ) {}
}

// Multiple providers with same token (multi-provider)
@Module({
  providers: [
    { provide: 'PLUGINS', useValue: 'plugin1', multi: true },
    { provide: 'PLUGINS', useValue: 'plugin2', multi: true },
    { provide: 'PLUGINS', useValue: 'plugin3', multi: true },
  ],
})
export class PluginsModule {}

// Injecting all instances
@Injectable()
export class PluginManager {
  constructor(@Inject('PLUGINS') private plugins: string[]) {
    // plugins = ['plugin1', 'plugin2', 'plugin3']
  }
}

// Interface tokens (using abstract classes)
// user-repository.interface.ts
export abstract class IUserRepository {
  abstract findAll(): Promise<User[]>;
}

// user-repository.ts
export class UserRepository extends IUserRepository {
  async findAll(): Promise<User[]> {
    return [];
  }
}

// app.module.ts
@Module({
  providers: [
    {
      provide: IUserRepository, // Abstract class as token
      useClass: UserRepository,
    },
  ],
})
export class AppModule {}

// Injecting interface
@Injectable()
export class UsersService {
  constructor(
    @Inject(IUserRepository) private userRepo: IUserRepository,
  ) {}
}
```
