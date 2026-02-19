# Question 26: How do you create conditional routes and route handlers in NestJS?

## Answer

You can use environment variables, configuration, or conditions to enable/disable routes dynamically.

## Example:

```typescript
// users.controller.ts
import { Controller, Get, Post, ForbiddenException, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('users')
export class UsersController {
  constructor(private configService: ConfigService) {}

  @Get()
  findAll() {
    return [];
  }

  // Conditional route based on environment
  @Get('admin')
  adminRoute() {
    if (this.configService.get('NODE_ENV') !== 'production') {
      return { message: 'Admin data' };
    }
    throw new ForbiddenException();
  }
}

// Using decorators for conditional routes
// feature-flag.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const FEATURE_FLAG_KEY = 'featureFlag';
export const FeatureFlag = (flag: string) =>
  SetMetadata(FEATURE_FLAG_KEY, flag);

// feature-flag.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { FEATURE_FLAG_KEY } from './decorators/feature-flag.decorator';

@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const flag = this.reflector.get<string>(
      FEATURE_FLAG_KEY,
      context.getHandler(),
    );

    if (!flag) {
      return true;
    }

    const isEnabled = this.configService.get(`FEATURE_${flag.toUpperCase()}`) === 'true';
    
    if (!isEnabled) {
      throw new ForbiddenException(`Feature ${flag} is not enabled`);
    }

    return true;
  }
}

// Usage
@Controller('users')
@UseGuards(FeatureFlagGuard)
export class UsersController {
  @Get('beta')
  @FeatureFlag('BETA_FEATURE')
  betaFeature() {
    return { message: 'Beta feature' };
  }
}

// Conditional module registration
// app.module.ts
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    UsersModule,
    ...(process.env.ENABLE_ADMIN === 'true' ? [AdminModule] : []),
  ],
})
export class AppModule {}

// Dynamic route registration
// dynamic-routes.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DynamicRoutesService {
  constructor(private configService: ConfigService) {}

  registerRoutes() {
    if (this.configService.get('ENABLE_EXPERIMENTAL') === 'true') {
      // Register experimental routes
    }
  }
}
```
