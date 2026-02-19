# Question 13: How do you handle route parameters, query parameters, and request body in NestJS?

## Answer

NestJS provides decorators to extract data from different parts of the HTTP request: `@Param()` for route parameters, `@Query()` for query parameters, and `@Body()` for request body.

## Example:

```typescript
// users.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  Headers,
  Ip,
  HostParam,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Route parameters
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // Multiple route parameters
  @Get(':userId/posts/:postId')
  findUserPost(
    @Param('userId') userId: string,
    @Param('postId') postId: string,
  ) {
    return this.usersService.findUserPost(userId, postId);
  }

  // All route parameters as object
  @Get(':userId/posts/:postId/comments/:commentId')
  findComment(@Param() params: { userId: string; postId: string; commentId: string }) {
    return this.usersService.findComment(params);
  }

  // Query parameters
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
  ) {
    return this.usersService.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      sort,
    });
  }

  // All query parameters as object
  @Get('search')
  search(@Query() query: { q: string; page?: number; limit?: number }) {
    return this.usersService.search(query);
  }

  // Request body
  @Post()
  create(@Body() createUserDto: any) {
    return this.usersService.create(createUserDto);
  }

  // Partial body extraction
  @Post('register')
  register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('name') name: string,
  ) {
    return this.usersService.register({ email, password, name });
  }

  // Headers
  @Get('profile')
  getProfile(@Headers('authorization') auth: string) {
    return this.usersService.getProfile(auth);
  }

  // All headers
  @Get('headers')
  getHeaders(@Headers() headers: Record<string, string>) {
    return headers;
  }

  // IP address
  @Get('ip')
  getIp(@Ip() ip: string) {
    return { ip };
  }

  // Host parameter
  @Get('host')
  getHost(@HostParam() host: string) {
    return { host };
  }
}

// DTOs for type safety
// create-user.dto.ts
export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  age?: number;
}

// query-params.dto.ts
export class QueryParamsDto {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}

// Usage with DTOs
@Get()
findAll(@Query() query: QueryParamsDto) {
  return this.usersService.findAll(query);
}

@Post()
create(@Body() createUserDto: CreateUserDto) {
  return this.usersService.create(createUserDto);
}
```
