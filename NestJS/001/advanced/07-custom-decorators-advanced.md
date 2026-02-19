# Question 42: How do you create advanced custom decorators in NestJS?

## Answer

Advanced decorators can combine multiple decorators, add complex metadata, and create reusable patterns.

## Example:

```typescript
// api-response.decorator.ts
import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponse, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status: 200,
      schema: {
        allOf: [
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              total: { type: 'number' },
              page: { type: 'number' },
              limit: { type: 'number' },
            },
          },
        ],
      },
    }),
  );
};

// Usage
@Get()
@ApiPaginatedResponse(User)
findAll() {
  return this.usersService.findAll();
}

// auth-required.decorator.ts
import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

export const AuthRequired = (...roles: string[]) => {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(...roles),
  );
};

// Usage
@Get('admin')
@AuthRequired('admin')
getAdminData() {
  return {};
}

// cache.decorator.ts
import { applyDecorators, UseInterceptors, SetMetadata } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

export const Cache = (ttl: number = 300, key?: string) => {
  return applyDecorators(
    UseInterceptors(CacheInterceptor),
    SetMetadata('cache-ttl', ttl),
    SetMetadata('cache-key', key),
  );
};

// rate-limit.decorator.ts
import { applyDecorators, UseGuards } from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

export const RateLimit = (limit: number, ttl: number) => {
  return applyDecorators(
    UseGuards(ThrottlerGuard),
    Throttle(limit, ttl),
  );
};

// version.decorator.ts
import { applyDecorators, Controller, SetMetadata } from '@nestjs/common';

export const ApiVersion = (version: string, route: string = '') => {
  return applyDecorators(
    Controller(`v${version}${route ? '/' + route : ''}`),
    SetMetadata('api-version', version),
  );
};

// Usage
@ApiVersion('1', 'users')
export class UsersV1Controller {}

// transform-response.decorator.ts
import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { TransformInterceptor } from '../interceptors/transform.interceptor';

export const TransformResponse = (options?: { exclude?: string[] }) => {
  return applyDecorators(
    UseInterceptors(new TransformInterceptor(options)),
  );
};

// validation-groups.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ValidationGroups = (...groups: string[]) => {
  return SetMetadata('validation-groups', groups);
};

// Custom pipe that uses validation groups
@Post()
@ValidationGroups('create')
create(@Body() dto: CreateUserDto) {
  return this.usersService.create(dto);
}

// timing.decorator.ts
import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { TimingInterceptor } from '../interceptors/timing.interceptor';

export const Timing = (label?: string) => {
  return applyDecorators(
    UseInterceptors(new TimingInterceptor(label)),
  );
};

// logging.decorator.ts
import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';

export const Log = (level: 'debug' | 'info' | 'warn' | 'error' = 'info') => {
  return applyDecorators(
    SetMetadata('log-level', level),
    UseInterceptors(LoggingInterceptor),
  );
};

// combine multiple decorators
// api-endpoint.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { Get, Post, Put, Delete } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthRequired } from './auth-required.decorator';
import { Cache } from './cache.decorator';
import { RateLimit } from './rate-limit.decorator';

export const ApiEndpoint = (config: {
  method: 'get' | 'post' | 'put' | 'delete';
  path?: string;
  summary: string;
  auth?: string[];
  cache?: number;
  rateLimit?: { limit: number; ttl: number };
}) => {
  const decorators = [];

  // HTTP method
  const methodDecorator = {
    get: Get,
    post: Post,
    put: Put,
    delete: Delete,
  }[config.method];

  decorators.push(methodDecorator(config.path || ''));

  // Swagger
  decorators.push(
    ApiOperation({ summary: config.summary }),
    ApiResponse({ status: 200, description: 'Success' }),
  );

  // Auth
  if (config.auth) {
    decorators.push(AuthRequired(...config.auth));
  }

  // Cache
  if (config.cache) {
    decorators.push(Cache(config.cache));
  }

  // Rate limit
  if (config.rateLimit) {
    decorators.push(RateLimit(config.rateLimit.limit, config.rateLimit.ttl));
  }

  return applyDecorators(...decorators);
};

// Usage
@Controller('users')
export class UsersController {
  @ApiEndpoint({
    method: 'get',
    summary: 'Get all users',
    cache: 300,
    rateLimit: { limit: 10, ttl: 60 },
  })
  findAll() {
    return [];
  }

  @ApiEndpoint({
    method: 'post',
    summary: 'Create user',
    auth: ['admin'],
  })
  create() {
    return {};
  }
}
```
