# Question 22: How do you set HTTP status codes in NestJS?

## Answer

NestJS provides decorators and methods to set HTTP status codes for responses.

## Example:

```typescript
// users.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

@Controller('users')
export class UsersController {
  @Get()
  @HttpCode(HttpStatus.OK) // 200
  findAll() {
    return [];
  }

  @Post()
  @HttpCode(HttpStatus.CREATED) // 201
  create(@Body() createUserDto: any) {
    return { id: 1, ...createUserDto };
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 204
  update(@Param('id') id: string) {
    // No content returned
  }

  @Delete(':id')
  @HttpCode(HttpStatus.ACCEPTED) // 202
  remove(@Param('id') id: string) {
    return { message: 'Deletion accepted' };
  }

  // Using @Res() for full control
  @Get('custom')
  customResponse(@Res() res: Response) {
    return res.status(201).json({ message: 'Custom status' });
  }

  // Built-in status codes
  @Get('not-found')
  @HttpCode(HttpStatus.NOT_FOUND) // 404
  notFound() {
    return { message: 'Not found' };
  }

  @Get('unauthorized')
  @HttpCode(HttpStatus.UNAUTHORIZED) // 401
  unauthorized() {
    return { message: 'Unauthorized' };
  }

  @Get('forbidden')
  @HttpCode(HttpStatus.FORBIDDEN) // 403
  forbidden() {
    return { message: 'Forbidden' };
  }

  @Get('bad-request')
  @HttpCode(HttpStatus.BAD_REQUEST) // 400
  badRequest() {
    return { message: 'Bad request' };
  }
}
```
