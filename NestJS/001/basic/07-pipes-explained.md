# Question 7: What are Pipes in NestJS? Explain with examples.

## Answer

Pipes are used to transform input data and validate it. They run before the route handler receives the data. NestJS provides built-in pipes and allows you to create custom pipes.

## Built-in Pipes:

- `ValidationPipe` - Validates DTOs
- `ParseIntPipe` - Transforms string to integer
- `ParseFloatPipe` - Transforms string to float
- `ParseBoolPipe` - Transforms string to boolean
- `ParseUUIDPipe` - Validates UUID
- `ParseArrayPipe` - Validates arrays
- `DefaultValuePipe` - Provides default values

## Example:

```typescript
// users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UsePipes,
  ParseIntPipe,
  ParseBoolPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('active', new DefaultValuePipe(true), ParseBoolPipe) active: boolean,
  ) {
    return this.usersService.findAll({ page, limit, active });
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}

// Custom Pipe Example
// parse-email.pipe.ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseEmailPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new BadRequestException('Invalid email format');
    }
    return value.toLowerCase();
  }
}

// Usage in controller
@Get('by-email/:email')
findByEmail(@Param('email', ParseEmailPipe) email: string) {
  return this.usersService.findByEmail(email);
}
```
