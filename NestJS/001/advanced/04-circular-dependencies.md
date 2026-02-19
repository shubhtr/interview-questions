# Question 39: How do you resolve Circular Dependencies in NestJS?

## Answer

Circular dependencies occur when two modules or services depend on each other. NestJS provides `forwardRef()` to resolve them.

## Example:

```typescript
// users.service.ts
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject(forwardRef(() => PostsService))
    private postsService: PostsService,
  ) {}

  findUserPosts(userId: number) {
    return this.postsService.findByUserId(userId);
  }
}

// posts.service.ts
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class PostsService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async findByUserId(userId: number) {
    const user = await this.usersService.findOne(userId);
    // Return posts for user
    return [];
  }
}

// Module-level circular dependency
// users.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [forwardRef(() => PostsModule)],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

// posts.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [forwardRef(() => UsersModule)],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}

// Alternative: Using ModuleRef to break circular dependency
// users.service.ts
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class UsersService {
  private postsService: PostsService;

  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    // Lazy load PostsService after module initialization
    this.postsService = this.moduleRef.get(PostsService, { strict: false });
  }

  findUserPosts(userId: number) {
    return this.postsService.findByUserId(userId);
  }
}

// Better approach: Extract shared logic to a third service
// shared.service.ts
@Injectable()
export class SharedService {
  // Shared logic that both services need
  processData(data: any) {
    return data;
  }
}

// users.service.ts
@Injectable()
export class UsersService {
  constructor(private sharedService: SharedService) {}
}

// posts.service.ts
@Injectable()
export class PostsService {
  constructor(private sharedService: SharedService) {}
}

// shared.module.ts
@Module({
  providers: [SharedService],
  exports: [SharedService],
})
export class SharedModule {}

// users.module.ts
@Module({
  imports: [SharedModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

// posts.module.ts
@Module({
  imports: [SharedModule],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
```
