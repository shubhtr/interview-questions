# Question 1: What is NestJS and what are its main features?

## Answer

NestJS is a progressive Node.js framework for building efficient and scalable server-side applications. It uses TypeScript and is built on top of Express (or Fastify) and heavily inspired by Angular.

## Main Features:

1. **Modular Architecture**: Built with modules, controllers, and providers
2. **Dependency Injection**: Built-in IoC container
3. **TypeScript Support**: First-class TypeScript support
4. **Decorators**: Extensive use of decorators for metadata
5. **Guards, Interceptors, Pipes**: Built-in request/response handling
6. **Microservices Support**: Built-in microservices support
7. **Testing**: Easy unit and e2e testing

## Example: Basic NestJS Application

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();

// app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

// app.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
```
