# Question 21: How do you set route prefixes and versioning in NestJS?

## Answer

Route prefixes can be set globally or per controller. Versioning allows you to manage API versions.

## Example:

```typescript
// main.ts - Global prefix
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api'); // All routes will have /api prefix
  await app.listen(3000);
}
bootstrap();

// users.controller.ts - Controller prefix
import { Controller, Get } from '@nestjs/common';

@Controller('users') // Route: /api/users
export class UsersController {
  @Get() // GET /api/users
  findAll() {
    return [];
  }

  @Get(':id') // GET /api/users/:id
  findOne(@Param('id') id: string) {
    return { id };
  }
}

// Versioning - URI versioning
// main.ts
app.setGlobalPrefix('api');
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1',
});

// users.controller.ts
@Controller({
  path: 'users',
  version: '1', // /api/v1/users
})
export class UsersV1Controller {}

@Controller({
  path: 'users',
  version: '2', // /api/v2/users
})
export class UsersV2Controller {}

// Versioning - Header versioning
app.enableVersioning({
  type: VersioningType.HEADER,
  header: 'X-API-Version',
});

// Versioning - Media type versioning
app.enableVersioning({
  type: VersioningType.MEDIA_TYPE,
  key: 'v=',
});

// Multiple versions
@Controller({
  path: 'users',
  version: ['1', '2'], // Supports both versions
})
export class UsersController {}
```
