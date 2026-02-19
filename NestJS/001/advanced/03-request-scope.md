# Question 38: How do you implement Request-Scoped Providers in NestJS?

## Answer

Request-scoped providers create a new instance for each incoming request, useful for request-specific data or when you need to isolate state per request.

## Example:

```typescript
// request-context.service.ts
import { Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  private requestId: string;
  private userId: number;

  constructor(@Inject(REQUEST) private request: Request) {
    this.requestId = this.generateRequestId();
    this.userId = this.extractUserId();
  }

  getRequestId(): string {
    return this.requestId;
  }

  getUserId(): number {
    return this.userId;
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private extractUserId(): number {
    return (this.request as any).user?.id || 0;
  }
}

// users.service.ts
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class UsersService {
  private requestData: Map<string, any> = new Map();

  constructor(private requestContext: RequestContextService) {
    // Each request gets its own instance
    this.requestData.set('requestId', this.requestContext.getRequestId());
  }

  findAll() {
    return {
      data: [],
      requestId: this.requestData.get('requestId'),
    };
  }
}

// users.module.ts
import { Module, Scope } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RequestContextService } from './request-context.service';

@Module({
  controllers: [UsersController],
  providers: [
    RequestContextService,
    {
      provide: UsersService,
      useClass: UsersService,
      scope: Scope.REQUEST,
    },
  ],
})
export class UsersModule {}

// Using with middleware
// request-context.middleware.ts
import { Injectable, NestMiddleware, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request, Response, NextFunction } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Add request-specific data
    (req as any).requestId = `${Date.now()}-${Math.random()}`;
    (req as any).startTime = Date.now();
    next();
  }
}

// Performance monitoring with request scope
// performance.service.ts
import { Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class PerformanceService {
  private startTime: number;
  private operations: Array<{ name: string; duration: number }> = [];

  constructor(@Inject(REQUEST) private request: Request) {
    this.startTime = Date.now();
  }

  startOperation(name: string): () => void {
    const operationStart = Date.now();
    return () => {
      const duration = Date.now() - operationStart;
      this.operations.push({ name, duration });
    };
  }

  getMetrics() {
    return {
      totalDuration: Date.now() - this.startTime,
      operations: this.operations,
    };
  }
}

// users.service.ts (with performance tracking)
@Injectable({ scope: Scope.REQUEST })
export class UsersService {
  constructor(
    private performanceService: PerformanceService,
  ) {}

  async findAll() {
    const endOperation = this.performanceService.startOperation('findAll');
    // Database query
    const result = [];
    endOperation();
    return result;
  }
}

// Important: Request-scoped providers cannot be injected into singleton providers
// This will cause an error:
@Injectable() // Singleton
export class SingletonService {
  constructor(
    private requestScopedService: RequestContextService, // ERROR!
  ) {}
}

// Solution: Use REQUEST object directly or use ModuleRef
// singleton.service.ts
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class SingletonService {
  constructor(private moduleRef: ModuleRef) {}

  async getRequestScopedService() {
    return this.moduleRef.get(RequestContextService, { strict: false });
  }
}
```
