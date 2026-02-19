# Question 2: What is a Module in NestJS? Explain with example.

## Answer

A Module is a class annotated with the `@Module()` decorator. It organizes the application into cohesive blocks of functionality. Modules are the basic building blocks of a NestJS application.

## Module Properties:

- **imports**: Array of modules that export providers required by this module
- **controllers**: Array of controllers that must be instantiated
- **providers**: Array of providers that will be instantiated and shared across this module
- **exports**: Array of providers that should be available to other modules

## Example:

```typescript
// users.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export to make it available to other modules
})
export class UsersModule {}

// users.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() createUserDto: any) {
    return this.usersService.create(createUserDto);
  }
}

// users.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  private users = [];

  findAll() {
    return this.users;
  }

  create(user: any) {
    this.users.push(user);
    return user;
  }
}
```
