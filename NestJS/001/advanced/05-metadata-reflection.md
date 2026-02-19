# Question 40: How do you use Metadata and Reflection in NestJS?

## Answer

NestJS uses metadata and reflection extensively for dependency injection, decorators, and runtime type information. You can create custom metadata and use reflection APIs.

## Example:

```typescript
// custom-metadata.decorator.ts
import { SetMetadata, Reflector } from '@nestjs/common';

// Define metadata key
export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';
export const PUBLIC_KEY = 'isPublic';

// Custom decorators
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
export const Public = () => SetMetadata(PUBLIC_KEY, true);

// Using Reflector to read metadata
// roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './decorators/custom-metadata.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}

// Custom metadata with complex data
// api-version.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const API_VERSION_KEY = 'apiVersion';
export const ApiVersion = (version: string) =>
  SetMetadata(API_VERSION_KEY, version);

// Reading metadata in interceptor
// version.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { API_VERSION_KEY } from './decorators/api-version.decorator';

@Injectable()
export class VersionInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const version = this.reflector.get<string>(
      API_VERSION_KEY,
      context.getHandler(),
    );

    if (version) {
      const request = context.switchToHttp().getRequest();
      request.apiVersion = version;
    }

    return next.handle();
  }
}

// Custom parameter metadata
// user-param.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);

// Using metadata in custom pipes
// transform-metadata.pipe.ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class TransformMetadataPipe implements PipeTransform {
  constructor(private reflector: Reflector) {}

  transform(value: any, metadata: ArgumentMetadata) {
    // Get custom metadata
    const customMetadata = this.reflector.get(
      'customTransform',
      metadata.metatype,
    );

    if (customMetadata) {
      // Apply transformation based on metadata
      return this.applyTransformation(value, customMetadata);
    }

    return value;
  }

  private applyTransformation(value: any, metadata: any) {
    // Transformation logic
    return value;
  }
}

// Runtime type information
// type-info.decorator.ts
import 'reflect-metadata';

export const TYPE_METADATA_KEY = 'design:type';
export const PARAM_TYPES_METADATA_KEY = 'design:paramtypes';
export const RETURN_TYPE_METADATA_KEY = 'design:returntype';

// Example: Getting parameter types
function getParameterTypes(target: any, propertyKey: string) {
  return Reflect.getMetadata(
    PARAM_TYPES_METADATA_KEY,
    target,
    propertyKey,
  );
}

// Example: Getting return type
function getReturnType(target: any, propertyKey: string) {
  return Reflect.getMetadata(
    RETURN_TYPE_METADATA_KEY,
    target,
    propertyKey,
  );
}

// Usage in service
@Injectable()
export class UsersService {
  findOne(id: number): User {
    return { id, name: 'John' };
  }
}

// Get metadata
const paramTypes = getParameterTypes(UsersService.prototype, 'findOne');
// Returns: [Number]

const returnType = getReturnType(UsersService.prototype, 'findOne');
// Returns: User

// Custom metadata storage
// metadata-storage.ts
export class MetadataStorage {
  private static storage = new Map<string, any>();

  static set(key: string, value: any) {
    this.storage.set(key, value);
  }

  static get(key: string) {
    return this.storage.get(key);
  }

  static has(key: string): boolean {
    return this.storage.has(key);
  }
}

// Using in decorator
export function Cacheable(ttl: number) {
  return function (target: any, propertyKey: string) {
    MetadataStorage.set(`${target.constructor.name}.${propertyKey}`, {
      ttl,
      cached: true,
    });
  };
}
```
