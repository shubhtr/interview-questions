# Question 43: How do you write advanced tests in NestJS? Explain mocking, integration tests, and test utilities.

## Answer

Advanced testing in NestJS involves mocking dependencies, testing async operations, integration testing, and using test utilities.

## Example:

```typescript
// users.service.spec.ts - Advanced unit test
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [{ id: 1, name: 'John' }];
      mockRepository.find.mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toEqual(users);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const user = { id: 1, name: 'John' };
      mockRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne(1);
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a user', async () => {
      const userData = { name: 'John', email: 'john@example.com' };
      const createdUser = { id: 1, ...userData };
      
      mockRepository.create.mockReturnValue(createdUser);
      mockRepository.save.mockResolvedValue(createdUser);

      const result = await service.create(userData);
      expect(result).toEqual(createdUser);
      expect(mockRepository.create).toHaveBeenCalledWith(userData);
      expect(mockRepository.save).toHaveBeenCalledWith(createdUser);
    });
  });
});

// Integration test
// users.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../src/users/entities/user.entity';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DataSource)
      .useValue({
        // Use test database
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await dataSource.getRepository(User).clear();
  });

  describe('/users (POST)', () => {
    it('should create a user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ name: 'John', email: 'john@example.com' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('John');
        });
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ name: '' })
        .expect(400);
    });
  });

  describe('/users (GET)', () => {
    it('should return all users', async () => {
      // Create test data
      await dataSource.getRepository(User).save([
        { name: 'John', email: 'john@example.com' },
        { name: 'Jane', email: 'jane@example.com' },
      ]);

      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(2);
        });
    });
  });
});

// Testing with mocks and spies
// email.service.spec.ts
import { Test } from '@nestjs/testing';
import { EmailService } from './email.service';
import { Logger } from '@nestjs/common';

describe('EmailService', () => {
  let service: EmailService;
  let logger: jest.Mocked<Logger>;

  beforeEach(async () => {
    const mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    logger = module.get(Logger);
  });

  it('should send email and log', async () => {
    await service.sendEmail('test@example.com', 'Subject', 'Body');
    
    expect(logger.log).toHaveBeenCalledWith(
      expect.stringContaining('Sending email'),
    );
  });
});

// Testing async operations
// users.service.spec.ts (async)
describe('UsersService - Async', () => {
  it('should handle concurrent requests', async () => {
    const promises = Array.from({ length: 10 }, (_, i) =>
      service.create({ name: `User${i}`, email: `user${i}@example.com` }),
    );

    const results = await Promise.all(promises);
    expect(results.length).toBe(10);
  });

  it('should handle errors in async operations', async () => {
    mockRepository.save.mockRejectedValue(new Error('Database error'));

    await expect(
      service.create({ name: 'John', email: 'john@example.com' }),
    ).rejects.toThrow('Database error');
  });
});

// Testing with timeouts
// timeout.service.spec.ts
describe('TimeoutService', () => {
  jest.setTimeout(10000); // 10 seconds

  it('should complete within timeout', async () => {
    const result = await service.longRunningOperation();
    expect(result).toBeDefined();
  });
});

// Testing with custom test utilities
// test-utils.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export async function createTestingModule(
  providers: any[],
  imports: any[] = [],
) {
  return Test.createTestingModule({
    imports,
    providers,
  }).compile();
}

export function createMockRepository<T>(): jest.Mocked<Repository<T>> {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as any;
}
```
