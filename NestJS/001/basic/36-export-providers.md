# Question 36: How do you export providers from modules? Explain module exports.

## Answer

Exporting providers makes them available to other modules that import the module. Use the `exports` array in `@Module()` decorator.

## Example:

```typescript
// users.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export to make it available to other modules
})
export class UsersModule {}

// posts.module.ts - Can use UsersService
import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule], // Import to use exported providers
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}

// posts.service.ts
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class PostsService {
  constructor(private usersService: UsersService) {} // Available because exported

  async createPost(userId: number, postData: any) {
    const user = await this.usersService.findOne(userId);
    // Create post for user
    return { ...postData, userId };
  }
}

// Exporting multiple providers
@Module({
  providers: [ServiceA, ServiceB, ServiceC],
  exports: [ServiceA, ServiceB, ServiceC], // Export all
})
export class ServicesModule {}

// Re-exporting modules
@Module({
  imports: [DatabaseModule, CacheModule],
  exports: [DatabaseModule, CacheModule], // Re-export for other modules
})
export class SharedModule {}

// Exporting with different token
@Module({
  providers: [
    UsersService,
    {
      provide: 'USER_REPOSITORY',
      useClass: UserRepository,
    },
  ],
  exports: [UsersService, 'USER_REPOSITORY'], // Export both
})
export class UsersModule {}

// Using exported provider
@Module({
  imports: [UsersModule],
  providers: [PostsService],
})
export class PostsModule {}

@Injectable()
export class PostsService {
  constructor(
    private usersService: UsersService,
    @Inject('USER_REPOSITORY') private userRepo: UserRepository,
  ) {}
}
```
