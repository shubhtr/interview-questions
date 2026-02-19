# Question 48: How do you create custom CLI commands in NestJS?

## Answer

NestJS CLI can be extended with custom commands using Commander.js or by creating custom scripts that use NestJS's application context.

## Example:

```typescript
// Install: npm install commander

// scripts/migrate.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

async function migrate() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    await dataSource.runMigrations();
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

migrate();

// scripts/seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/users/users.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const users = [
    { name: 'John Doe', email: 'john@example.com' },
    { name: 'Jane Smith', email: 'jane@example.com' },
  ];

  for (const user of users) {
    await usersService.create(user);
  }

  console.log('Seeding completed');
  await app.close();
}

seed();

// scripts/custom-command.ts
import { Command } from 'commander';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

const program = new Command();

program
  .name('nest-cli')
  .description('Custom NestJS CLI commands')
  .version('1.0.0');

program
  .command('user:create')
  .description('Create a new user')
  .requiredOption('-n, --name <name>', 'User name')
  .requiredOption('-e, --email <email>', 'User email')
  .action(async (options) => {
    const app = await NestFactory.createApplicationContext(AppModule);
    const usersService = app.get(UsersService);

    try {
      const user = await usersService.create({
        name: options.name,
        email: options.email,
      });
      console.log('User created:', user);
    } catch (error) {
      console.error('Error creating user:', error);
      process.exit(1);
    } finally {
      await app.close();
    }
  });

program
  .command('db:reset')
  .description('Reset the database')
  .option('-f, --force', 'Force reset without confirmation')
  .action(async (options) => {
    if (!options.force) {
      console.log('This will delete all data. Use --force to confirm.');
      process.exit(1);
    }

    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);

    try {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
      console.log('Database reset completed');
    } catch (error) {
      console.error('Error resetting database:', error);
      process.exit(1);
    } finally {
      await app.close();
    }
  });

program.parse();

// package.json
{
  "scripts": {
    "migrate": "ts-node scripts/migrate.ts",
    "seed": "ts-node scripts/seed.ts",
    "cli": "ts-node scripts/custom-command.ts"
  }
}

// Using NestJS CLI custom commands
// nest-cli.json
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  },
  "customCommands": [
    {
      "name": "generate:module",
      "description": "Generate a new module with custom structure"
    }
  ]
}

// Custom schematic
// schematics/custom-module/schema.json
{
  "$schema": "http://json-schema.org/schema",
  "id": "custom-module",
  "title": "Custom Module Schematic",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Module name"
    }
  },
  "required": ["name"]
}

// schematics/custom-module/index.ts
import {
  Rule,
  Tree,
  SchematicContext,
  apply,
  url,
  template,
  move,
  mergeWith,
} from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';

export function customModule(options: any): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const sourceTemplates = url('./files');
    const sourceParametrizedTemplates = apply(sourceTemplates, [
      template({
        ...options,
        ...strings,
      }),
      move('src'),
    ]);

    return mergeWith(sourceParametrizedTemplates)(tree, context);
  };
}

// Batch operations command
// scripts/batch-operations.ts
import { Command } from 'commander';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

const program = new Command();

program
  .command('batch:process')
  .description('Process items in batch')
  .option('-s, --size <size>', 'Batch size', '100')
  .option('-d, --delay <delay>', 'Delay between batches (ms)', '1000')
  .action(async (options) => {
    const app = await NestFactory.createApplicationContext(AppModule);
    const batchService = app.get(BatchService);

    const batchSize = parseInt(options.size);
    const delay = parseInt(options.delay);

    try {
      await batchService.processBatches(batchSize, delay);
      console.log('Batch processing completed');
    } catch (error) {
      console.error('Batch processing failed:', error);
      process.exit(1);
    } finally {
      await app.close();
    }
  });

program.parse();
```
