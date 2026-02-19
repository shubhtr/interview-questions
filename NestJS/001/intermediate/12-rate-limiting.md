# Question 32: How do you implement rate limiting in NestJS?

## Answer

Rate limiting can be implemented using `@nestjs/throttler` package to protect APIs from abuse.

## Example:

```typescript
// Install: npm install @nestjs/throttler

// app.module.ts
import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60, // Time window in seconds
      limit: 10, // Maximum number of requests
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

// users.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('users')
@UseGuards(ThrottlerGuard)
export class UsersController {
  @Get()
  findAll() {
    return [];
  }

  // Custom rate limit for specific route
  @Throttle(5, 60) // 5 requests per 60 seconds
  @Get('popular')
  findPopular() {
    return [];
  }
}

// Custom rate limit decorator
// throttle.decorator.ts
import { applyDecorators, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

export const RateLimit = (limit: number, ttl: number) => {
  return applyDecorators(
    UseGuards(ThrottlerGuard),
    Throttle(limit, ttl),
  );
};

// Usage
@Get()
@RateLimit(20, 60)
findAll() {
  return [];
}

// Using with storage (Redis)
// app.module.ts
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
      storage: new ThrottlerStorageRedisService({
        host: 'localhost',
        port: 6379,
      }),
    }),
  ],
})
export class AppModule {}

// Custom rate limit guard
// custom-throttler.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerOptions } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Use IP address or user ID
    return req.ip || req.user?.id || req.headers['x-forwarded-for'];
  }

  protected async generateKey(
    context: ExecutionContext,
    tracker: string,
    throttler: ThrottlerOptions,
  ): Promise<string> {
    const route = this.reflector.get<string>('route', context.getHandler());
    return `${route}:${tracker}`;
  }
}

// Using custom guard
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}

// Skip rate limiting
// skip-throttle.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const SkipThrottle = () => SetMetadata('skipThrottle', true);

// Custom guard with skip support
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected shouldSkip(context: ExecutionContext): boolean {
    return this.reflector.get<boolean>('skipThrottle', context.getHandler());
  }
}

// Usage
@Get('public')
@SkipThrottle()
findPublic() {
  return [];
}

// Different limits for different endpoints
@Controller('users')
export class UsersController {
  @Throttle(10, 60) // 10 requests per minute
  @Get()
  findAll() {
    return [];
  }

  @Throttle(5, 60) // 5 requests per minute
  @Post()
  create() {
    return {};
  }

  @Throttle(100, 60) // 100 requests per minute
  @Get('search')
  search() {
    return [];
  }
}
```
