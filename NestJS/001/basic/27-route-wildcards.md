# Question 27: How do you use route wildcards and catch-all routes in NestJS?

## Answer

Wildcards allow you to match multiple routes with a single handler. Use `*` for wildcards.

## Example:

```typescript
// app.controller.ts
import { Controller, Get, All, Req, NotFoundException } from '@nestjs/common';
import { Request } from 'express';

@Controller()
export class AppController {
  // Catch-all route (must be last)
  @Get('*')
  catchAll() {
    return { message: 'Route not found' };
  }

  // Specific routes should come before wildcards
  @Get('users')
  getUsers() {
    return [];
  }

  @Get('posts')
  getPosts() {
    return [];
  }
}

// Wildcard in middle of path
import { Controller, Get, Param } from '@nestjs/common';

@Controller('api')
export class ApiController {
  @Get('v*') // Matches /api/v1, /api/v2, etc.
  versionedRoute(@Param('0') version: string) {
    return { version };
  }

  @Get('users/*/posts') // Matches /api/users/1/posts, /api/users/2/posts
  getUserPosts(@Param('0') userId: string) {
    return { userId, posts: [] };
  }
}

// Multiple wildcards
import { Controller, Get, Param } from '@nestjs/common';

@Controller('files')
export class FilesController {
  @Get('*/*') // Matches /files/folder/file
  getFile(@Param('0') path: string) {
    return { path };
  }
}

// Using @All() for all HTTP methods
import { Controller, All, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('catch')
export class CatchController {
  @All('*')
  catchAll(@Req() req: Request) {
    return {
      method: req.method,
      url: req.url,
      message: 'Caught all requests',
    };
  }
}

// Route order matters
import { Controller, Get, Param, NotFoundException } from '@nestjs/common';

@Controller('api')
export class ApiController {
  // Specific routes first
  @Get('users')
  getUsers() {
    return [];
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return { id };
  }

  // Wildcard last
  @Get('*')
  notFound() {
    throw new NotFoundException();
  }
}
```
