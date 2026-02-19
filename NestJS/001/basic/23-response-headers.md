# Question 23: How do you set custom response headers in NestJS?

## Answer

You can set response headers using the `@Header()` decorator or the `@Res()` object.

## Example:

```typescript
// users.controller.ts
import {
  Controller,
  Get,
  Post,
  Header,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

@Controller('users')
export class UsersController {
  @Get()
  @Header('Cache-Control', 'no-cache')
  @Header('X-Custom-Header', 'custom-value')
  findAll() {
    return [];
  }

  @Get('download')
  downloadFile(@Res() res: Response) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="file.pdf"');
    res.send(Buffer.from('file content'));
  }

  @Get('json')
  getJson(@Res() res: Response) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Total-Count', '100');
    res.json({ data: [] });
  }

  // Multiple headers
  @Get('custom')
  customHeaders(@Res() res: Response) {
    res.set({
      'X-Custom-1': 'value1',
      'X-Custom-2': 'value2',
      'Cache-Control': 'public, max-age=3600',
    });
    res.json({ message: 'Success' });
  }
}

// Using interceptor for global headers
// headers.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class HeadersInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    
    response.setHeader('X-Powered-By', 'NestJS');
    response.setHeader('X-Request-ID', Date.now().toString());
    
    return next.handle();
  }
}
```
