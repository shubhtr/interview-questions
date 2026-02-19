# Question 30: How do you handle Optional Dependencies in NestJS?

## Answer

Use `@Optional()` decorator to mark dependencies as optional. If not provided, the value will be `undefined` instead of throwing an error.

## Example:

```typescript
// users.service.ts
import { Injectable, Optional, Inject } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    @Optional() @Inject('OPTIONAL_SERVICE') private optionalService?: any,
    @Optional() @Inject('CACHE_SERVICE') private cacheService?: any,
  ) {}

  findAll() {
    // Check if optional service exists
    if (this.optionalService) {
      this.optionalService.doSomething();
    }

    // Use optional service with default behavior
    const cached = this.cacheService?.get('users') || [];
    return cached;
  }
}

// app.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users/users.service';

@Module({
  providers: [
    UsersService,
    // Optional service not provided - no error
    // {
    //   provide: 'OPTIONAL_SERVICE',
    //   useValue: { doSomething: () => console.log('Done') },
    // },
  ],
})
export class AppModule {}

// Conditional optional dependency
// feature.service.ts
import { Injectable, Optional, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FeatureService {
  constructor(
    @Optional() @Inject('PREMIUM_FEATURE') private premiumFeature?: any,
    private configService: ConfigService,
  ) {}

  useFeature() {
    const isPremium = this.configService.get('PREMIUM_ENABLED') === 'true';
    
    if (isPremium && this.premiumFeature) {
      return this.premiumFeature.execute();
    }
    
    return this.basicFeature();
  }

  private basicFeature() {
    return { message: 'Basic feature' };
  }
}

// Multiple optional dependencies
@Injectable()
export class MultiOptionalService {
  constructor(
    @Optional() @Inject('SERVICE_A') private serviceA?: any,
    @Optional() @Inject('SERVICE_B') private serviceB?: any,
    @Optional() @Inject('SERVICE_C') private serviceC?: any,
  ) {}

  execute() {
    const services = [this.serviceA, this.serviceB, this.serviceC]
      .filter(Boolean);
    
    return services.map(s => s.process());
  }
}
```
