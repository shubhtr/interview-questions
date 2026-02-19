# Question 33: How do you transform data using class-transformer in NestJS?

## Answer

class-transformer is used to transform plain objects to class instances and vice versa. It's commonly used with DTOs and validation.

## Example:

```typescript
// user.dto.ts
import { Exclude, Expose, Transform, Type } from 'class-transformer';

export class UserDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Exclude() // Exclude from serialization
  password: string;

  @Transform(({ value }) => value?.toUpperCase())
  @Expose()
  role: string;

  @Transform(({ obj }) => `${obj.firstName} ${obj.lastName}`)
  @Expose()
  fullName: string;

  @Type(() => Date)
  @Expose()
  createdAt: Date;

  @Transform(({ value }) => value || 'N/A')
  @Expose()
  phone?: string;
}

// users.controller.ts
import { Controller, Get, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  @Get()
  findAll() {
    const users = [
      {
        id: 1,
        name: 'John',
        email: 'john@example.com',
        password: 'secret',
        role: 'user',
        createdAt: new Date(),
      },
    ];

    // Transform plain object to DTO instance
    return plainToInstance(UserDto, users, {
      excludeExtraneousValues: true, // Only include @Expose() fields
    });
  }
}

// Transform nested objects
export class AddressDto {
  @Expose()
  street: string;

  @Expose()
  city: string;
}

export class UserWithAddressDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Type(() => AddressDto)
  @Expose()
  address: AddressDto;
}

// Transform arrays
export class UsersResponseDto {
  @Type(() => UserDto)
  @Expose()
  users: UserDto[];

  @Expose()
  total: number;
}

// Custom transformation
@Transform(({ value, obj }) => {
  if (value) return value;
  return `${obj.firstName} ${obj.lastName}`;
})
@Expose()
displayName: string;

// Transform with conditions
@Transform(({ value, obj }) => {
  if (obj.role === 'admin') {
    return value;
  }
  return undefined;
})
@Expose()
adminData?: any;
```
