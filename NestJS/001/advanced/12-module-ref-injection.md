# Question 47: How do you use ModuleRef for dynamic dependency injection in NestJS?

## Answer

ModuleRef allows you to dynamically resolve providers, useful for breaking circular dependencies, lazy loading, and accessing providers at runtime.

## Example:

```typescript
// users.service.ts - Using ModuleRef
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class UsersService implements OnModuleInit {
  private postsService: PostsService;

  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    // Resolve service after module initialization
    this.postsService = this.moduleRef.get(PostsService, { strict: false });
  }

  async getUserPosts(userId: number) {
    return this.postsService.findByUserId(userId);
  }
}

// Resolving scoped providers
// request-scoped.service.ts
import { Injectable, Scope } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class RequestScopedService {
  getData() {
    return { requestId: Date.now() };
  }
}

// singleton.service.ts
@Injectable()
export class SingletonService {
  constructor(private moduleRef: ModuleRef) {}

  getRequestScopedService() {
    // Get request-scoped service dynamically
    return this.moduleRef.get(RequestScopedService, { strict: false });
  }
}

// Resolving by token
// tokens.ts
export const DATABASE_CONNECTION = Symbol('DATABASE_CONNECTION');

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

// users.service.ts
@Injectable()
export class UsersService {
  private db: DatabaseConnection;

  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    this.db = this.moduleRef.get(DATABASE_CONNECTION, { strict: false });
  }
}

// Resolving multiple instances
// multi-provider.service.ts
@Module({
  providers: [
    { provide: 'PLUGINS', useValue: 'plugin1', multi: true },
    { provide: 'PLUGINS', useValue: 'plugin2', multi: true },
    { provide: 'PLUGINS', useValue: 'plugin3', multi: true },
  ],
})
export class PluginsModule {}

// app.service.ts
@Injectable()
export class AppService {
  constructor(private moduleRef: ModuleRef) {}

  getAllPlugins() {
    // Get all instances
    return this.moduleRef.get('PLUGINS', { strict: false });
  }
}

// Creating instances dynamically
// factory.service.ts
@Injectable()
export class FactoryService {
  constructor(private moduleRef: ModuleRef) {}

  createService<T>(serviceClass: new (...args: any[]) => T): T {
    return this.moduleRef.create(serviceClass);
  }

  async createServiceAsync<T>(
    serviceClass: new (...args: any[]) => T,
  ): Promise<T> {
    return this.moduleRef.resolve(serviceClass);
  }
}

// Getting context
// context.service.ts
@Injectable()
export class ContextService {
  constructor(private moduleRef: ModuleRef) {}

  getModuleContext() {
    // Get the module that contains this service
    return this.moduleRef;
  }

  async resolveInContext<T>(token: any): Promise<T> {
    return this.moduleRef.resolve(token);
  }
}

// Lazy loading modules
// lazy-loader.service.ts
import { Injectable } from '@nestjs/common';
import { ModuleRef, LazyModuleLoader } from '@nestjs/core';

@Injectable()
export class LazyLoaderService {
  constructor(private lazyModuleLoader: LazyModuleLoader) {}

  async loadModule(moduleClass: any) {
    const moduleRef = await this.lazyModuleLoader.load(() => moduleClass);
    return moduleRef;
  }

  async getServiceFromLazyModule<T>(moduleClass: any, serviceClass: any): Promise<T> {
    const moduleRef = await this.loadModule(moduleClass);
    return moduleRef.get(serviceClass);
  }
}

// Breaking circular dependencies
// users.service.ts
@Injectable()
export class UsersService {
  private postsService: PostsService;

  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    // Resolve after both modules are initialized
    this.postsService = this.moduleRef.get(PostsService, { strict: false });
  }
}

// posts.service.ts
@Injectable()
export class PostsService {
  private usersService: UsersService;

  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    this.usersService = this.moduleRef.get(UsersService, { strict: false });
  }
}

// Conditional provider resolution
// conditional.service.ts
@Injectable()
export class ConditionalService {
  private service: any;

  constructor(
    private moduleRef: ModuleRef,
    private configService: ConfigService,
  ) {}

  onModuleInit() {
    const serviceType = this.configService.get('SERVICE_TYPE', 'default');
    
    if (serviceType === 'premium') {
      this.service = this.moduleRef.get(PremiumService, { strict: false });
    } else {
      this.service = this.moduleRef.get(DefaultService, { strict: false });
    }
  }
}

// Getting all providers of a type
// provider-finder.service.ts
@Injectable()
export class ProviderFinderService {
  constructor(private moduleRef: ModuleRef) {}

  findAllProviders<T>(token: any): T[] {
    // This requires access to the internal container
    // Usually done through reflection or custom implementation
    return [];
  }
}
```
