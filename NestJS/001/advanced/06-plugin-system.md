# Question 41: How do you create a Plugin System in NestJS?

## Answer

You can create a plugin system using dynamic modules, interfaces, and the module system to allow third-party extensions.

## Example:

```typescript
// plugin.interface.ts
export interface Plugin {
  name: string;
  version: string;
  initialize(context: PluginContext): void;
  onModuleInit?(): void | Promise<void>;
  onModuleDestroy?(): void | Promise<void>;
}

export interface PluginContext {
  app: any;
  config: any;
  logger: any;
}

// plugin-manager.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Plugin, PluginContext } from './interfaces/plugin.interface';

@Injectable()
export class PluginManagerService implements OnModuleInit, OnModuleDestroy {
  private plugins: Map<string, Plugin> = new Map();
  private context: PluginContext;

  constructor(context: PluginContext) {
    this.context = context;
  }

  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} is already registered`);
    }

    this.plugins.set(plugin.name, plugin);
    plugin.initialize(this.context);
  }

  unregister(name: string): void {
    const plugin = this.plugins.get(name);
    if (plugin && plugin.onModuleDestroy) {
      plugin.onModuleDestroy();
    }
    this.plugins.delete(name);
  }

  getPlugin(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  async onModuleInit() {
    for (const plugin of this.plugins.values()) {
      if (plugin.onModuleInit) {
        await plugin.onModuleInit();
      }
    }
  }

  async onModuleDestroy() {
    for (const plugin of this.plugins.values()) {
      if (plugin.onModuleDestroy) {
        await plugin.onModuleDestroy();
      }
    }
  }
}

// Example plugin: Analytics Plugin
// analytics.plugin.ts
import { Plugin, PluginContext } from '../interfaces/plugin.interface';

export class AnalyticsPlugin implements Plugin {
  name = 'analytics';
  version = '1.0.0';
  private context: PluginContext;

  initialize(context: PluginContext): void {
    this.context = context;
    this.context.logger.log('Analytics plugin initialized');
  }

  async onModuleInit() {
    this.context.logger.log('Analytics plugin started');
  }

  track(event: string, data: any) {
    this.context.logger.log(`Tracking event: ${event}`, data);
  }
}

// Example plugin: Cache Plugin
// cache.plugin.ts
import { Plugin, PluginContext } from '../interfaces/plugin.interface';

export class CachePlugin implements Plugin {
  name = 'cache';
  version = '1.0.0';
  private context: PluginContext;
  private cache: Map<string, any> = new Map();

  initialize(context: PluginContext): void {
    this.context = context;
    this.context.logger.log('Cache plugin initialized');
  }

  set(key: string, value: any, ttl?: number): void {
    this.cache.set(key, value);
    if (ttl) {
      setTimeout(() => this.cache.delete(key), ttl);
    }
  }

  get(key: string): any {
    return this.cache.get(key);
  }
}

// plugin.module.ts
import { Module, DynamicModule } from '@nestjs/common';
import { PluginManagerService } from './plugin-manager.service';
import { Plugin } from './interfaces/plugin.interface';

@Module({})
export class PluginModule {
  static forRoot(plugins: Plugin[]): DynamicModule {
    return {
      module: PluginModule,
      providers: [
        {
          provide: PluginManagerService,
          useFactory: (app: any, config: any, logger: any) => {
            const manager = new PluginManagerService({ app, config, logger });
            plugins.forEach(plugin => manager.register(plugin));
            return manager;
          },
          inject: ['APP', 'CONFIG', 'LOGGER'],
        },
      ],
      exports: [PluginManagerService],
    };
  }

  static forRootAsync(options: {
    imports?: any[];
    useFactory: (...args: any[]) => Promise<Plugin[]> | Plugin[];
    inject?: any[];
  }): DynamicModule {
    return {
      module: PluginModule,
      imports: options.imports || [],
      providers: [
        {
          provide: PluginManagerService,
          useFactory: async (...args: any[]) => {
            const plugins = await options.useFactory(...args);
            const manager = new PluginManagerService({
              app: args[0],
              config: args[1],
              logger: args[2],
            });
            plugins.forEach(plugin => manager.register(plugin));
            return manager;
          },
          inject: options.inject || [],
        },
      ],
      exports: [PluginManagerService],
    };
  }
}

// app.module.ts
import { Module } from '@nestjs/common';
import { PluginModule } from './plugins/plugin.module';
import { AnalyticsPlugin } from './plugins/analytics.plugin';
import { CachePlugin } from './plugins/cache.plugin';

@Module({
  imports: [
    PluginModule.forRoot([
      new AnalyticsPlugin(),
      new CachePlugin(),
    ]),
  ],
})
export class AppModule {}

// Using plugins in services
// users.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { PluginManagerService } from '../plugins/plugin-manager.service';
import { AnalyticsPlugin } from '../plugins/analytics.plugin';

@Injectable()
export class UsersService {
  constructor(
    @Inject(PluginManagerService)
    private pluginManager: PluginManagerService,
  ) {}

  async create(userData: any) {
    const user = { id: Date.now(), ...userData };
    
    // Use analytics plugin
    const analytics = this.pluginManager.getPlugin('analytics') as AnalyticsPlugin;
    if (analytics) {
      analytics.track('user.created', { userId: user.id });
    }
    
    return user;
  }
}
```
