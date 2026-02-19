# Question 29: How do you use Event Emitter in NestJS?

## Answer

NestJS provides `@nestjs/event-emitter` package for implementing the observer pattern and handling events within the application.

## Example:

```typescript
// Install: npm install @nestjs/event-emitter

// app.module.ts
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    UsersModule,
  ],
})
export class AppModule {}

// user-created.event.ts
export class UserCreatedEvent {
  constructor(
    public readonly userId: number,
    public readonly email: string,
    public readonly name: string,
  ) {}
}

// user-updated.event.ts
export class UserUpdatedEvent {
  constructor(
    public readonly userId: number,
    public readonly changes: any,
  ) {}
}

// users.service.ts
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserCreatedEvent } from './events/user-created.event';
import { UserUpdatedEvent } from './events/user-updated.event';

@Injectable()
export class UsersService {
  constructor(private eventEmitter: EventEmitter2) {}

  async create(userData: any) {
    const user = { id: Date.now(), ...userData };
    
    // Emit event
    this.eventEmitter.emit(
      'user.created',
      new UserCreatedEvent(user.id, user.email, user.name),
    );
    
    return user;
  }

  async update(id: number, updateData: any) {
    // Update logic
    
    // Emit event
    this.eventEmitter.emit(
      'user.updated',
      new UserUpdatedEvent(id, updateData),
    );
    
    return { id, ...updateData };
  }
}

// email.listener.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserCreatedEvent } from '../users/events/user-created.event';

@Injectable()
export class EmailListener {
  @OnEvent('user.created')
  handleUserCreated(event: UserCreatedEvent) {
    console.log(`Sending welcome email to ${event.email}`);
    // Send welcome email
  }

  @OnEvent('user.created', { async: true })
  async handleUserCreatedAsync(event: UserCreatedEvent) {
    // Async event handling
    await this.sendWelcomeEmail(event.email);
  }

  private async sendWelcomeEmail(email: string) {
    // Email sending logic
  }
}

// notification.listener.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserCreatedEvent } from '../users/events/user-created.event';
import { UserUpdatedEvent } from '../users/events/user-updated.event';

@Injectable()
export class NotificationListener {
  @OnEvent('user.created')
  handleUserCreated(event: UserCreatedEvent) {
    console.log(`Creating notification for user ${event.userId}`);
    // Create notification
  }

  @OnEvent('user.updated')
  handleUserUpdated(event: UserUpdatedEvent) {
    console.log(`User ${event.userId} was updated`);
    // Handle update notification
  }
}

// users.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { EmailListener } from '../listeners/email.listener';
import { NotificationListener } from '../listeners/notification.listener';

@Module({
  controllers: [UsersController],
  providers: [UsersService, EmailListener, NotificationListener],
})
export class UsersModule {}

// Using wildcards
// listener.ts
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class GlobalListener {
  @OnEvent('user.*')
  handleUserEvents(event: any) {
    console.log('User event:', event);
  }

  @OnEvent('**')
  handleAllEvents(event: any) {
    console.log('Any event:', event);
  }
}

// Using event namespaces
// users.service.ts
this.eventEmitter.emit('users.created', event);
this.eventEmitter.emit('users.updated', event);

// listener.ts
@OnEvent('users.*')
handleUsersEvents(event: any) {
  // Handle all users events
}
```
