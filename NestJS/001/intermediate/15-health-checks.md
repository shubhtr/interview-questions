# Question 35: How do you implement health checks in NestJS?

## Answer

NestJS provides `@nestjs/terminus` package for health checks that can monitor database, Redis, HTTP endpoints, and more.

## Example:

```typescript
// Install: npm install @nestjs/terminus

// health.module.ts
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { DatabaseHealthIndicator } from './indicators/database.health';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
  providers: [DatabaseHealthIndicator],
})
export class HealthModule {}

// health.controller.ts
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  HttpHealthIndicator,
} from '@nestjs/terminus';
import { DatabaseHealthIndicator } from './indicators/database.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private http: HttpHealthIndicator,
    private database: DatabaseHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Memory check
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
      
      // Disk check
      () =>
        this.disk.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.9,
        }),
      
      // HTTP check
      () =>
        this.http.pingCheck('api', 'https://api.example.com'),
      
      // Database check
      () => this.database.isHealthy('database'),
    ]);
  }

  @Get('liveness')
  @HealthCheck()
  liveness() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    ]);
  }

  @Get('readiness')
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.database.isHealthy('database'),
      () => this.http.pingCheck('api', 'https://api.example.com'),
    ]);
  }
}

// indicators/database.health.ts
import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(@InjectConnection() private connection: Connection) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.connection.query('SELECT 1');
      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError('Database check failed', error);
    }
  }
}

// MongoDB health indicator
// mongodb.health.ts
import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class MongodbHealthIndicator extends HealthIndicator {
  constructor(@InjectConnection() private connection: Connection) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const isHealthy = this.connection.readyState === 1;
    const result = this.getStatus(key, isHealthy);

    if (isHealthy) {
      return result;
    }
    throw new HealthCheckError('MongoDB check failed', result);
  }
}

// Redis health indicator
// redis.health.ts
import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { Redis } from 'ioredis';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private redis: Redis) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.redis.ping();
      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError('Redis check failed', error);
    }
  }
}

// Custom health indicator
// custom.health.ts
import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';

@Injectable()
export class CustomHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const isHealthy = this.checkCustomService();
    const result = this.getStatus(key, isHealthy, { custom: 'data' });

    if (isHealthy) {
      return result;
    }
    throw new HealthCheckError('Custom service check failed', result);
  }

  private checkCustomService(): boolean {
    // Custom health check logic
    return true;
  }
}
```
