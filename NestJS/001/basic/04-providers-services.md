# Question 4: What are Providers and Services in NestJS?

## Answer

Providers are classes that can be injected as dependencies. The `@Injectable()` decorator marks a class as a provider. Services are a common type of provider that contain business logic.

## Key Points:

- Providers are instantiated by NestJS's dependency injection system
- They can be injected into controllers, other services, or modules
- Services typically contain reusable business logic

## Example:

```typescript
// users.service.ts
import { Injectable } from '@nestjs/common';

export interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable()
export class UsersService {
  private users: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  ];

  findAll(): User[] {
    return this.users;
  }

  findOne(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  create(user: Omit<User, 'id'>): User {
    const newUser: User = {
      id: this.users.length + 1,
      ...user,
    };
    this.users.push(newUser);
    return newUser;
  }

  update(id: number, updateData: Partial<User>): User | null {
    const user = this.findOne(id);
    if (!user) return null;
    
    Object.assign(user, updateData);
    return user;
  }

  remove(id: number): boolean {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return false;
    
    this.users.splice(index, 1);
    return true;
  }
}

// users.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Post()
  create(@Body() createUserDto: any) {
    return this.usersService.create(createUserDto);
  }
}
```
