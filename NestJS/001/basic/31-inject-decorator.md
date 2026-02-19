# Question 31: What is the @Inject() decorator and when do you use it?

## Answer

`@Inject()` is used to inject dependencies by token (string, symbol, or class). It's required when injecting non-class providers or when you need explicit token specification.

## Example:

```typescript
// Using string tokens
// app.module.ts
import { Module } from '@nestjs/common';

@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useValue: { host: 'localhost', port: 5432 },
    },
    {
      provide: 'API_KEY',
      useValue: 'secret-key-123',
    },
  ],
})
export class AppModule {}

// users.service.ts
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    @Inject('DATABASE_CONNECTION') private db: any,
    @Inject('API_KEY') private apiKey: string,
  ) {}
}

// Using symbol tokens
// tokens.ts
export const DATABASE_CONNECTION = Symbol('DATABASE_CONNECTION');
export const CACHE_SERVICE = Symbol('CACHE_SERVICE');

// app.module.ts
import { DATABASE_CONNECTION } from './tokens';

@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useValue: new DatabaseConnection(),
    },
  ],
})
export class AppModule {}

// users.service.ts
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from './tokens';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: DatabaseConnection,
  ) {}
}

// Using with factory providers
@Module({
  providers: [
    {
      provide: 'CONFIG',
      useFactory: () => ({
        apiUrl: process.env.API_URL,
        timeout: 5000,
      }),
    },
  ],
})
export class ConfigModule {}

// Using in service
@Injectable()
export class ApiService {
  constructor(@Inject('CONFIG') private config: any) {
    console.log('API URL:', this.config.apiUrl);
  }
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
    console.log('Plugins:', this.plugins); // ['plugin1', 'plugin2', 'plugin3']
  }
}
```
