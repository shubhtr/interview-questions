# Question 24: How do you implement caching with Redis in NestJS?

## Answer

NestJS provides built-in caching support and can be configured to use Redis as the cache store.

## Example:

```typescript
// Install: npm install @nestjs/cache-manager cache-manager cache-manager-redis-store
// Install: npm install redis

// app.module.ts
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6379),
        ttl: 300, // 5 minutes
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}

// users.service.ts - Using CacheInterceptor
import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class UsersService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async findAll(): Promise<any[]> {
    const cacheKey = 'users:all';
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Fetch from database
    const users = await this.fetchUsersFromDB();
    
    // Store in cache
    await this.cacheManager.set(cacheKey, users, 300); // 5 minutes
    
    return users;
  }

  async findOne(id: number): Promise<any> {
    const cacheKey = `user:${id}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const user = await this.fetchUserFromDB(id);
    await this.cacheManager.set(cacheKey, user, 300);
    
    return user;
  }

  async invalidateCache(pattern: string): Promise<void> {
    // Invalidate cache by pattern
    const keys = await this.cacheManager.store.keys(pattern);
    await Promise.all(keys.map(key => this.cacheManager.del(key)));
  }

  private async fetchUsersFromDB(): Promise<any[]> {
    // Database query
    return [];
  }

  private async fetchUserFromDB(id: number): Promise<any> {
    // Database query
    return { id, name: 'John' };
  }
}

// users.controller.ts - Using CacheInterceptor
import { Controller, Get, Param, UseInterceptors, CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300) // 5 minutes
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('user')
  @CacheTTL(600) // 10 minutes
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
}

// Custom cache decorator
// cache.decorator.ts
import { applyDecorators, UseInterceptors, CacheInterceptor, SetMetadata } from '@nestjs/common';

export const Cache = (ttl: number = 300) => {
  return applyDecorators(
    UseInterceptors(CacheInterceptor),
    SetMetadata('cache-ttl', ttl),
  );
};

// Usage
@Get()
@Cache(600)
findAll() {
  return this.usersService.findAll();
}

// Manual cache service
// cache.service.ts
import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }

  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    return this.cacheManager.wrap(key, fn, ttl);
  }
}
```
