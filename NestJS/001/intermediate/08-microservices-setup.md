# Question 28: How do you set up microservices in NestJS?

## Answer

NestJS provides built-in support for microservices with various transport layers (TCP, Redis, RabbitMQ, etc.).

## Example:

```typescript
// Install: npm install @nestjs/microservices

// main.ts (Microservice)
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // TCP Microservice
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: 3001,
      },
    },
  );

  // Redis Microservice
  // const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  //   AppModule,
  //   {
  //     transport: Transport.REDIS,
  //     options: {
  //       host: 'localhost',
  //       port: 6379,
  //     },
  //   },
  // );

  await app.listen();
  console.log('Microservice is listening');
}
bootstrap();

// app.controller.ts (Microservice)
import { Controller } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Request-Response pattern
  @MessagePattern({ cmd: 'get_user' })
  getUser(@Payload() data: { id: number }) {
    return this.appService.getUser(data.id);
  }

  // Event pattern (fire and forget)
  @EventPattern('user_created')
  handleUserCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('User created event:', data);
    this.appService.handleUserCreated(data);
  }

  // Multiple patterns
  @MessagePattern({ cmd: 'create_user' })
  createUser(@Payload() data: any) {
    return this.appService.createUser(data);
  }
}

// main.ts (API Gateway - Client)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Connect to microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 3001,
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();

// users.controller.ts (API Gateway)
import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

@Controller('users')
export class UsersController {
  private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: 3001,
      },
    });
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.client.send({ cmd: 'get_user' }, { id: +id }).toPromise();
  }

  @Post()
  async createUser(@Body() createUserDto: any) {
    return this.client.send({ cmd: 'create_user' }, createUserDto).toPromise();
  }

  @Post('event')
  async emitEvent(@Body() data: any) {
    this.client.emit('user_created', data);
    return { message: 'Event emitted' };
  }
}

// Using with custom client module
// users.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UsersController } from './users.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3001,
        },
      },
    ]),
  ],
  controllers: [UsersController],
})
export class UsersModule {}

// users.controller.ts (with injection)
import { Controller, Get, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('users')
export class UsersController {
  constructor(
    @Inject('USER_SERVICE') private client: ClientProxy,
  ) {}

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.client.send({ cmd: 'get_user' }, { id: +id }).toPromise();
  }
}

// Using RabbitMQ
// app.module.ts
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'users_queue',
        },
      },
    ]),
  ],
})
export class AppModule {}
```
