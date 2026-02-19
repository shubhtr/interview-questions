# Question 34: What are HTTP Exceptions in NestJS? How do you use them?

## Answer

NestJS provides built-in HTTP exceptions that extend HttpException. They automatically set appropriate HTTP status codes and error messages.

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
  Body,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get(':id')
  findOne(@Param('id') id: string) {
    if (!id || isNaN(+id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = this.usersService.findOne(+id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  @Post()
  create(@Body() createUserDto: any) {
    if (!createUserDto.email) {
      throw new BadRequestException('Email is required');
    }

    const existing = this.usersService.findByEmail(createUserDto.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    const user = this.usersService.findOne(+id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.usersService.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const user = this.usersService.findOne(+id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.usersService.remove(+id);
  }

  // Custom exception with status code
  @Get('error/custom')
  customError() {
    throw new HttpException(
      {
        statusCode: 418,
        message: "I'm a teapot",
        error: 'Custom Error',
      },
      418,
    );
  }

  // Using HttpStatus enum
  @Get('error/status')
  statusError() {
    throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  // Exception with description
  @Get('error/description')
  descriptionError() {
    throw new BadRequestException('Invalid input', 'Custom error description');
  }
}

// Custom exception class
// business-exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(message: string, public readonly code: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        code,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

// Usage
@Get('business-error')
businessError() {
  throw new BusinessException('Business rule violation', 'BUSINESS_ERROR_001');
}
```
