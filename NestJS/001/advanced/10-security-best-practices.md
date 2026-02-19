# Question 45: What are security best practices in NestJS?

## Answer

Security best practices include input validation, authentication, authorization, CORS, helmet, rate limiting, and secure headers.

## Example:

```typescript
// Install: npm install helmet express-rate-limit

// main.ts - Security setup
import { NestFactory } from '@nestjs/core';
import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Helmet for security headers
  app.use(helmet());

  // CORS configuration
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP',
    }),
  );

  // Trust proxy (if behind reverse proxy)
  app.set('trust proxy', 1);

  await app.listen(3000);
}
bootstrap();

// Input sanitization
// sanitize.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import * as sanitizeHtml from 'sanitize-html';

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      return sanitizeHtml(value, {
        allowedTags: [],
        allowedAttributes: {},
      });
    }

    if (typeof value === 'object' && value !== null) {
      return this.sanitizeObject(value);
    }

    return value;
  }

  private sanitizeObject(obj: any): any {
    const sanitized = {};
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        sanitized[key] = sanitizeHtml(obj[key]);
      } else if (typeof obj[key] === 'object') {
        sanitized[key] = this.sanitizeObject(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }
    return sanitized;
  }
}

// Usage
@Post()
create(@Body(SanitizePipe) createUserDto: CreateUserDto) {
  return this.usersService.create(createUserDto);
}

// SQL injection prevention (TypeORM handles this)
// users.service.ts
@Injectable()
export class UsersService {
  // Safe - uses parameterized queries
  async findByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email }, // TypeORM handles parameterization
    });
  }

  // Safe - uses query builder
  async search(query: string) {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.name LIKE :name', { name: `%${query}%` })
      .getMany();
  }
}

// XSS prevention
// xss.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class XssGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Validate and sanitize input
    if (request.body) {
      this.sanitizeInput(request.body);
    }
    
    if (request.query) {
      this.sanitizeInput(request.query);
    }
    
    return true;
  }

  private sanitizeInput(obj: any): void {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      }
    }
  }
}

// CSRF protection
// csrf.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as csrf from 'csurf';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private csrfProtection = csrf({ cookie: true });

  use(req: Request, res: Response, next: NextFunction) {
    this.csrfProtection(req, res, next);
  }
}

// Password hashing
// auth.service.ts
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

// JWT security
// jwt.config.ts
export const jwtConfig = {
  secret: process.env.JWT_SECRET, // Use strong secret
  signOptions: {
    expiresIn: '1h', // Short expiration
    issuer: 'your-app',
    audience: 'your-app-users',
  },
};

// Secure session configuration
// session.config.ts
export const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict', // CSRF protection
  },
};

// Environment variables validation
// config.validation.ts
import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  JWT_SECRET: Joi.string().required().min(32),
  DATABASE_URL: Joi.string().required(),
  ALLOWED_ORIGINS: Joi.string().required(),
});
```
