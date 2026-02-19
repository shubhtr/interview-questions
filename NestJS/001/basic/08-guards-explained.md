# Question 8: What are Guards in NestJS? Explain authentication guards.

## Answer

Guards determine whether a request should be handled by the route handler. They run after middleware but before interceptors and pipes. They're commonly used for authentication and authorization.

## Example:

```typescript
// auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    // Validate token logic
    const isValid = this.validateToken(token);
    if (!isValid) {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private validateToken(token: string): boolean {
    // Token validation logic
    return token.startsWith('Bearer ');
  }
}

// roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

// roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// users.controller.ts
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getAdminData() {
    return { message: 'Admin data' };
  }
}
```
