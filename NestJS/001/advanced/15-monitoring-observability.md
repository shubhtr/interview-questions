# Question 50: How do you implement monitoring and observability in NestJS?

## Answer

Monitoring and observability involve logging, metrics, tracing, APM (Application Performance Monitoring), and health checks.

## Example:

```typescript
// Install: npm install @opentelemetry/api @opentelemetry/sdk-trace-node
// Install: npm install prom-client

// metrics.service.ts
import { Injectable } from '@nestjs/common';
import { Registry, Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  private registry: Registry;
  private httpRequestDuration: Histogram;
  private httpRequestTotal: Counter;
  private activeConnections: Gauge;

  constructor() {
    this.registry = new Registry();
    
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.1, 0.5, 1, 2, 5],
      registers: [this.registry],
    });

    this.httpRequestTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.registry],
    });

    this.activeConnections = new Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
      registers: [this.registry],
    });
  }

  recordHttpRequest(method: string, route: string, status: number, duration: number) {
    this.httpRequestDuration.observe({ method, route, status: status.toString() }, duration);
    this.httpRequestTotal.inc({ method, route, status: status.toString() });
  }

  setActiveConnections(count: number) {
    this.activeConnections.set(count);
  }

  getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}

// metrics.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, route } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const duration = (Date.now() - startTime) / 1000;
          this.metricsService.recordHttpRequest(
            method,
            route?.path || 'unknown',
            response.statusCode,
            duration,
          );
        },
        error: (error) => {
          const duration = (Date.now() - startTime) / 1000;
          this.metricsService.recordHttpRequest(
            method,
            route?.path || 'unknown',
            error.status || 500,
            duration,
          );
        },
      }),
    );
  }
}

// metrics.controller.ts
import { Controller, Get } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Get()
  async getMetrics() {
    return this.metricsService.getMetrics();
  }
}

// Tracing with OpenTelemetry
// tracing.service.ts
import { Injectable } from '@nestjs/common';
import { trace, Span, context } from '@opentelemetry/api';

@Injectable()
export class TracingService {
  private tracer = trace.getTracer('nestjs-app');

  startSpan(name: string): Span {
    return this.tracer.startSpan(name);
  }

  async traceAsync<T>(
    name: string,
    fn: (span: Span) => Promise<T>,
  ): Promise<T> {
    const span = this.tracer.startSpan(name);
    try {
      const result = await fn(span);
      span.setStatus({ code: 1 }); // OK
      return result;
    } catch (error) {
      span.setStatus({ code: 2, message: error.message }); // ERROR
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  }
}

// APM integration
// apm.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as apm from 'elastic-apm-node';

@Injectable()
export class ApmService implements OnModuleInit {
  onModuleInit() {
    apm.start({
      serviceName: process.env.APM_SERVICE_NAME || 'nestjs-app',
      serverUrl: process.env.APM_SERVER_URL,
      environment: process.env.NODE_ENV,
    });
  }

  captureError(error: Error, context?: any) {
    apm.captureError(error, { custom: context });
  }

  startTransaction(name: string, type: string) {
    return apm.startTransaction(name, type);
  }
}

// Logging service with correlation IDs
// correlation-logger.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class CorrelationLoggerService {
  private correlationId: string;

  constructor(@Inject(REQUEST) private request: Request) {
    this.correlationId = (request.headers['x-correlation-id'] as string) ||
      this.generateCorrelationId();
  }

  log(message: string, context?: string) {
    Logger.log(
      `[${this.correlationId}] ${message}`,
      context || CorrelationLoggerService.name,
    );
  }

  error(message: string, trace: string, context?: string) {
    Logger.error(
      `[${this.correlationId}] ${message}`,
      trace,
      context || CorrelationLoggerService.name,
    );
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Health and monitoring endpoint
// monitoring.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { MetricsService } from './metrics.service';

@Controller('monitoring')
export class MonitoringController {
  constructor(
    private health: HealthCheckService,
    private metrics: MetricsService,
  ) {}

  @Get('health')
  @HealthCheck()
  healthCheck() {
    return this.health.check([]);
  }

  @Get('metrics')
  async getMetrics() {
    return this.metrics.getMetrics();
  }

  @Get('status')
  status() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };
  }
}
```
