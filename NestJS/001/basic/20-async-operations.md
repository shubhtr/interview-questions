# Question 20: How do you handle asynchronous operations in NestJS?

## Answer

NestJS supports async/await patterns and Promises. Controllers, services, and other providers can return Promises, Observables, or synchronous values.

## Example:

```typescript
// users.service.ts - Async operations
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  // Using async/await
  async findAll(): Promise<any[]> {
    // Simulate database call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([{ id: 1, name: 'John' }]);
      }, 100);
    });
  }

  // Using Promise directly
  findOne(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      if (id > 0) {
        resolve({ id, name: 'John' });
      } else {
        reject(new Error('Invalid ID'));
      }
    });
  }

  // Async with error handling
  async create(userData: any): Promise<any> {
    try {
      // Simulate async operation
      await this.validateUser(userData);
      const user = { id: Date.now(), ...userData };
      return user;
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  private async validateUser(userData: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!userData.email) {
        reject(new Error('Email is required'));
      } else {
        resolve();
      }
    });
  }

  // Using Observables (RxJS)
  findAllObservable(): Observable<any[]> {
    return of([{ id: 1, name: 'John' }]).pipe(
      delay(100),
      map(users => users),
    );
  }
}

// users.controller.ts - Async controller methods
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.usersService.findOne(+id);
    } catch (error) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  @Post()
  async create(@Body() createUserDto: any) {
    return await this.usersService.create(createUserDto);
  }
}

// database.service.ts - Database operations
import { Injectable } from '@nestjs/common';

@Injectable()
export class DatabaseService {
  async query(sql: string, params: any[]): Promise<any> {
    // Simulate database query
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ rows: [] });
      }, 50);
    });
  }

  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    // Simulate transaction
    try {
      const result = await callback();
      // Commit transaction
      return result;
    } catch (error) {
      // Rollback transaction
      throw error;
    }
  }
}

// users.service.ts - Using database service
import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(): Promise<any[]> {
    const result = await this.db.query('SELECT * FROM users', []);
    return result.rows;
  }

  async create(userData: any): Promise<any> {
    return await this.db.transaction(async () => {
      const result = await this.db.query(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
        [userData.name, userData.email],
      );
      return result.rows[0];
    });
  }
}
```
