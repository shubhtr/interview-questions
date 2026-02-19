# Question 37: How do module imports work in NestJS? Explain the import system.

## Answer

Module imports allow you to use providers from other modules. Imported modules' exported providers become available in the importing module.

## Example:

```typescript
// database.module.ts
import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}

// users.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule], // Import to use DatabaseService
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

// users.service.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {} // Available via import
}

// Circular imports - use forwardRef
// users.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [forwardRef(() => PostsModule)],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

// posts.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { PostsService } from './posts.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [forwardRef(() => UsersModule)],
  providers: [PostsService],
})
export class PostsModule {}

// Multiple imports
@Module({
  imports: [
    DatabaseModule,
    CacheModule,
    LoggerModule,
    ConfigModule,
  ],
  providers: [AppService],
})
export class AppModule {}

// Conditional imports
@Module({
  imports: [
    CoreModule,
    ...(process.env.ENABLE_FEATURE === 'true' ? [FeatureModule] : []),
  ],
})
export class AppModule {}

// Re-exporting for convenience
@Module({
  imports: [DatabaseModule, CacheModule],
  exports: [DatabaseModule, CacheModule], // Re-export
})
export class SharedModule {}

// Other modules can import SharedModule instead of both
@Module({
  imports: [SharedModule], // Gets both DatabaseModule and CacheModule
})
export class UsersModule {}
```
