# Question 44: How do you optimize performance in NestJS applications?

## Answer

Performance optimization in NestJS involves caching, connection pooling, lazy loading, compression, and efficient database queries.

## Example:

```typescript
// Enable compression
// main.ts
import { NestFactory } from '@nestjs/core';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable compression
  app.use(compression());
  
  await app.listen(3000);
}
bootstrap();

// Connection pooling
// database.module.ts
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      // Connection pool settings
      extra: {
        max: 20, // Maximum pool size
        min: 5,  // Minimum pool size
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      },
    }),
  ],
})
export class DatabaseModule {}

// Lazy loading modules
// app.module.ts
@Module({
  imports: [
    // Load heavy modules lazily
    LazyModuleLoader,
  ],
})
export class AppModule {
  constructor(private lazyModuleLoader: LazyModuleLoader) {}

  async onModuleInit() {
    // Load module only when needed
    const { HeavyModule } = await import('./heavy/heavy.module');
    const moduleRef = await this.lazyModuleLoader.load(() => HeavyModule);
  }
}

// Query optimization
// users.service.ts
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Use select to fetch only needed fields
  async findLightweight() {
    return this.usersRepository.find({
      select: ['id', 'name', 'email'],
    });
  }

  // Use relations efficiently
  async findWithPosts(id: number) {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['posts'], // Only load when needed
      select: {
        id: true,
        name: true,
        posts: {
          id: true,
          title: true,
        },
      },
    });
  }

  // Use query builder for complex queries
  async findOptimized() {
    return this.usersRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.name'])
      .leftJoinAndSelect('user.posts', 'post')
      .where('user.isActive = :isActive', { isActive: true })
      .cache(30000) // Cache for 30 seconds
      .getMany();
  }

  // Batch operations
  async createMany(users: CreateUserDto[]) {
    // Use bulk insert instead of individual inserts
    return this.usersRepository
      .createQueryBuilder()
      .insert()
      .into(User)
      .values(users)
      .execute();
  }
}

// Caching strategies
// users.service.ts (with caching)
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(): Promise<User[]> {
    const cacheKey = 'users:all';
    const cached = await this.cacheManager.get<User[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const users = await this.usersRepository.find({
      cache: 30000, // TypeORM cache
    });

    await this.cacheManager.set(cacheKey, users, 300);
    return users;
  }

  async invalidateCache() {
    await this.cacheManager.del('users:all');
  }
}

// Response compression interceptor
// compression.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as zlib from 'zlib';

@Injectable()
export class CompressionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    
    // Set compression headers
    response.setHeader('Content-Encoding', 'gzip');
    
    return next.handle().pipe(
      map((data) => {
        // Compress large responses
        if (JSON.stringify(data).length > 1024) {
          return zlib.gzipSync(JSON.stringify(data));
        }
        return data;
      }),
    );
  }
}

// Pagination for large datasets
// pagination.dto.ts
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

// users.service.ts (pagination)
async findAllPaginated(dto: PaginationDto) {
  const { page = 1, limit = 10 } = dto;
  const skip = (page - 1) * limit;

  const [data, total] = await this.usersRepository.findAndCount({
    skip,
    take: limit,
    cache: 30000,
  });

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// Database indexing
// user.entity.ts
@Entity('users')
@Index(['email']) // Single column index
@Index(['name', 'email']) // Composite index
export class User {
  @Index() // Column index
  @Column()
  email: string;
}

// Lazy relations
// user.entity.ts
@OneToMany(() => Post, post => post.user, { lazy: true })
posts: Promise<Post[]>;

// Use streaming for large datasets
// users.service.ts
async streamAll(): Promise<Readable> {
  const stream = new Readable({
    objectMode: true,
    async read() {
      const users = await this.usersRepository.find({ take: 100 });
      if (users.length === 0) {
        this.push(null);
      } else {
        users.forEach(user => this.push(user));
      }
    },
  });
  return stream;
}
```
