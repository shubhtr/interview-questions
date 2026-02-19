# Question 12: How do you create custom decorators in NestJS?

## Answer

Custom decorators allow you to add metadata to classes, methods, or parameters. They're useful for creating reusable functionality and extracting common patterns.

## Example:

```typescript
// user.decorator.ts - Parameter decorator
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);

// roles.decorator.ts - Method/Class decorator
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// public.decorator.ts - Skip authentication
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// api-version.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ApiVersion = (version: string) => SetMetadata('apiVersion', version);

// current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// usage in controller
// users.controller.ts
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { User } from './decorators/user.decorator';
import { Roles } from './decorators/roles.decorator';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Get('email')
  getEmail(@User('email') email: string) {
    return { email };
  }

  @Get('public')
  @Public()
  getPublicData() {
    return { message: 'This is public data' };
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getAdminData(@CurrentUser() user: any) {
    return { message: 'Admin data', user };
  }
}

// Custom class decorator
// api-controller.decorator.ts
import { Controller, SetMetadata } from '@nestjs/common';

export const ApiController = (prefix: string, version: string = 'v1') => {
  return (target: any) => {
    Controller(`api/${version}/${prefix}`)(target);
    SetMetadata('apiVersion', version)(target);
  };
};

// Usage
@ApiController('users', 'v2')
export class UsersV2Controller {
  // Routes will be: /api/v2/users
}
```
