# Question 26: How do you implement WebSockets in NestJS?

## Answer

NestJS provides `@nestjs/websockets` and `@nestjs/platform-socket.io` for WebSocket support using Socket.IO.

## Example:

```typescript
// Install: npm install @nestjs/websockets @nestjs/platform-socket.io socket.io

// chat.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connected', { message: 'Connected to server' });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: { room: string; message: string; user: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Message from ${client.id}: ${data.message}`);
    
    // Broadcast to room
    this.server.to(data.room).emit('message', {
      user: data.user,
      message: data.message,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.room);
    client.emit('joined-room', { room: data.room });
    client.to(data.room).emit('user-joined', {
      userId: client.id,
      message: 'User joined the room',
    });
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.room);
    client.emit('left-room', { room: data.room });
  }

  // Server-initiated events
  broadcastMessage(room: string, message: any) {
    this.server.to(room).emit('message', message);
  }

  sendToUser(userId: string, event: string, data: any) {
    this.server.to(userId).emit(event, data);
  }
}

// chat.module.ts
import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';

@Module({
  providers: [ChatGateway],
})
export class ChatModule {}

// Using with authentication
// auth.guard.ts (WebSocket)
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const token = client.handshake.auth.token;

    if (!token) {
      throw new WsException('Unauthorized');
    }

    // Validate token
    // Add user to socket data
    client.data.user = { id: 1, name: 'John' };
    
    return true;
  }
}

// chat.gateway.ts (with auth)
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from './guards/ws-auth.guard';

@WebSocketGateway()
@UseGuards(WsAuthGuard)
export class ChatGateway {
  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    // Use authenticated user
  }
}

// Client example (JavaScript)
/*
const socket = io('http://localhost:3000/chat', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.on('connected', (data) => {
  console.log(data);
});

socket.emit('join-room', { room: 'general' });

socket.on('message', (data) => {
  console.log('New message:', data);
});

socket.emit('message', {
  room: 'general',
  message: 'Hello!',
  user: 'John'
});
*/
```
