# Question 11: What is Middleware in NestJS? How do you create and use it?

## Answer

Middleware functions have access to the request and response objects, and the next middleware function. They can execute code, make changes to the request and response, end the request-response cycle, or call the next middleware.

## Example:

```typescript
// logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  }
}

// auth.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;
    
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Add user to request
    req['user'] = { id: 1, name: 'John Doe' };
    next();
  }
}

// cors.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    
    next();
  }
}

// app.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { AuthMiddleware } from './middleware/auth.middleware';
import { UsersController } from './users/users.controller';

@Module({
  controllers: [UsersController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, AuthMiddleware)
      .forRoutes('users'); // Apply to all routes starting with 'users'
    
    // Or apply to specific routes
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(UsersController);
    
    // Or exclude certain routes
    consumer
      .apply(AuthMiddleware)
      .exclude('users/public')
      .forRoutes('users');
  }
}

// Functional Middleware (simpler alternative)
// logger.middleware.ts
import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
}

// Usage in app.module.ts
consumer
  .apply(logger)
  .forRoutes('*');
```
