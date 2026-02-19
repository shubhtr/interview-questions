# Question 19: How do you write unit tests and e2e tests in NestJS?

## Answer

NestJS provides excellent testing support using Jest. You can test individual components (unit tests) or entire application flows (e2e tests).

## Example:

```typescript
// Install: npm install -D @nestjs/testing

// users.service.spec.ts - Unit Test
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', () => {
    const userData = { name: 'John', email: 'john@example.com' };
    const user = service.create(userData);
    
    expect(user).toHaveProperty('id');
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
  });

  it('should find all users', () => {
    service.create({ name: 'John', email: 'john@example.com' });
    service.create({ name: 'Jane', email: 'jane@example.com' });
    
    const users = service.findAll();
    expect(users.length).toBe(2);
  });

  it('should find one user by id', () => {
    const created = service.create({ name: 'John', email: 'john@example.com' });
    const found = service.findOne(created.id);
    
    expect(found).toBeDefined();
    expect(found.id).toBe(created.id);
  });
});

// users.controller.spec.ts - Controller Unit Test
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all users', () => {
    const users = [{ id: 1, name: 'John' }];
    mockUsersService.findAll.mockReturnValue(users);

    expect(controller.findAll()).toEqual(users);
    expect(mockUsersService.findAll).toHaveBeenCalled();
  });

  it('should create a user', () => {
    const userData = { name: 'John', email: 'john@example.com' };
    const createdUser = { id: 1, ...userData };
    mockUsersService.create.mockReturnValue(createdUser);

    expect(controller.create(userData)).toEqual(createdUser);
    expect(mockUsersService.create).toHaveBeenCalledWith(userData);
  });
});

// app.e2e-spec.ts - E2E Test
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({ name: 'John', email: 'john@example.com' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe('John');
      });
  });
});
```
