# Question 25: How do you access Request and Response objects directly in NestJS?

## Answer

You can access Express/Fastify request and response objects using `@Req()` and `@Res()` decorators.

## Example:

```typescript
// users.controller.ts
import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  Request,
  Response,
} from '@nestjs/common';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

@Controller('users')
export class UsersController {
  // Using @Req() decorator
  @Get()
  findAll(@Req() request: ExpressRequest) {
    const userAgent = request.headers['user-agent'];
    const ip = request.ip;
    return { userAgent, ip };
  }

  // Using @Request() decorator (alias for @Req())
  @Get('profile')
  getProfile(@Request() req: ExpressRequest) {
    return req.user;
  }

  // Using @Res() decorator
  @Get('custom')
  customResponse(@Res() res: ExpressResponse) {
    return res.status(201).json({ message: 'Custom response' });
  }

  // Using @Response() decorator (alias for @Res())
  @Get('download')
  download(@Response() res: ExpressResponse) {
    res.setHeader('Content-Type', 'application/json');
    res.json({ file: 'data' });
  }

  // Accessing request properties
  @Post()
  create(@Req() req: ExpressRequest, @Body() body: any) {
    const ip = req.ip;
    const hostname = req.hostname;
    const protocol = req.protocol;
    const method = req.method;
    const url = req.url;
    
    return {
      ...body,
      metadata: { ip, hostname, protocol, method, url },
    };
  }

  // Accessing headers
  @Get('headers')
  getHeaders(@Req() req: ExpressRequest) {
    return {
      authorization: req.headers.authorization,
      'user-agent': req.headers['user-agent'],
      'content-type': req.headers['content-type'],
    };
  }

  // Setting response headers
  @Get('set-headers')
  setHeaders(@Res() res: ExpressResponse) {
    res.setHeader('X-Custom', 'value');
    res.setHeader('X-Request-ID', Date.now().toString());
    return res.json({ message: 'Headers set' });
  }

  // Accessing cookies
  @Get('cookies')
  getCookies(@Req() req: ExpressRequest) {
    return req.cookies;
  }

  // Setting cookies
  @Get('set-cookie')
  setCookie(@Res() res: ExpressResponse) {
    res.cookie('token', 'value', {
      httpOnly: true,
      maxAge: 3600000,
    });
    return res.json({ message: 'Cookie set' });
  }
}
```
