# Question 46: How do you implement advanced error handling in NestJS?

## Answer

Advanced error handling involves custom exceptions, error filters, error logging, error transformation, and proper HTTP status codes.

## Example:

```typescript
// custom-exceptions.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(
    message: string,
    public readonly code: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        statusCode,
        message,
        code,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
}

export class ValidationException extends HttpException {
  constructor(errors: any[]) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        errors,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class NotFoundException extends HttpException {
  constructor(resource: string, id?: string | number) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: `${resource}${id ? ` with ID ${id}` : ''} not found`,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

// Global exception filter
// all-exceptions.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message:
        typeof message === 'string'
          ? message
          : (message as any).message || 'An error occurred',
      ...(typeof message === 'object' && { errors: (message as any).errors }),
    };

    // Log error
    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
    );

    response.status(status).json(errorResponse);
  }
}

// HTTP exception filter
// http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message:
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message,
      ...(typeof exceptionResponse === 'object' &&
        (exceptionResponse as any).errors && {
          errors: (exceptionResponse as any).errors,
        }),
    };

    this.logger.warn(
      `${status} ${request.method} ${request.url} - ${errorResponse.message}`,
    );

    response.status(status).json(errorResponse);
  }
}

// Validation exception filter
// validation-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'Validation failed',
      errors:
        typeof exceptionResponse === 'object'
          ? (exceptionResponse as any).message
          : exceptionResponse,
    };

    response.status(status).json(errorResponse);
  }
}

// Error interceptor
// error.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // Transform error
        if (error instanceof HttpException) {
          return throwError(() => error);
        }

        // Log unexpected errors
        console.error('Unexpected error:', error);

        // Return generic error
        return throwError(
          () =>
            new HttpException(
              'An unexpected error occurred',
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
        );
      }),
    );
  }
}

// Error logging service
// error-logger.service.ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ErrorLoggerService {
  private readonly logger = new Logger(ErrorLoggerService.name);

  logError(error: Error, context?: string, metadata?: any) {
    this.logger.error(
      {
        message: error.message,
        stack: error.stack,
        context,
        ...metadata,
      },
      error.stack,
    );
  }

  logHttpError(
    statusCode: number,
    message: string,
    path: string,
    method: string,
  ) {
    this.logger.warn({
      statusCode,
      message,
      path,
      method,
    });
  }
}

// Usage in service
// users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { ErrorLoggerService } from '../errors/error-logger.service';

@Injectable()
export class UsersService {
  constructor(private errorLogger: ErrorLoggerService) {}

  async findOne(id: number) {
    try {
      const user = await this.repository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException('User', id);
      }
      return user;
    } catch (error) {
      this.errorLogger.logError(error, 'UsersService.findOne', { userId: id });
      throw error;
    }
  }
}

// Global error handling setup
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { ErrorInterceptor } from './interceptors/error.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global error interceptor
  app.useGlobalInterceptors(new ErrorInterceptor());

  await app.listen(3000);
}
bootstrap();
```
