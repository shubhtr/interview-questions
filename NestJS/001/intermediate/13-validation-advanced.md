# Question 33: How do you implement advanced validation in NestJS?

## Answer

NestJS uses `class-validator` and `class-transformer` for validation. You can create custom validators and use validation groups.

## Example:

```typescript
// Install: npm install class-validator class-transformer

// create-user.dto.ts
import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  ValidateIf,
  Matches,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase, and number',
  })
  password: string;

  @IsOptional()
  @IsNumber()
  @Min(18, { message: 'Age must be at least 18' })
  @Max(120, { message: 'Age must not exceed 120' })
  @Transform(({ value }) => parseInt(value))
  age?: number;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid role' })
  role?: UserRole;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.phone)
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number' })
  phone?: string;
}

// Custom validator
// is-strong-password.validator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          
          const hasUpperCase = /[A-Z]/.test(value);
          const hasLowerCase = /[a-z]/.test(value);
          const hasNumber = /\d/.test(value);
          const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
          
          return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Password must contain uppercase, lowercase, number, and special character';
        },
      },
    });
  };
}

// Usage
export class CreateUserDto {
  @IsStrongPassword()
  password: string;
}

// Custom validator with parameters
// match.validator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function Match(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'match',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${args.property} must match ${relatedPropertyName}`;
        },
      },
    });
  };
}

// Usage
export class CreateUserDto {
  @IsString()
  password: string;

  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;
}

// Validation groups
// update-user.dto.ts
import { Validate } from 'class-validator';

export class UpdateUserDto {
  @IsString({ groups: ['name'] })
  name?: string;

  @IsEmail({}, { groups: ['email'] })
  email?: string;

  @IsString({ groups: ['password'] })
  password?: string;
}

// Usage in controller
@Put(':id')
async update(
  @Param('id') id: string,
  @Body(new ValidationPipe({ groups: ['name', 'email'] })) updateDto: UpdateUserDto,
) {
  return this.usersService.update(id, updateDto);
}

// Conditional validation
// create-user.dto.ts
export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @ValidateIf((o) => o.role === 'admin')
  @IsString()
  adminKey?: string;
}

// Custom validation pipe
// custom-validation.pipe.ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CustomValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const messages = errors.map((error) =>
        Object.values(error.constraints || {}).join(', '),
      );
      throw new BadRequestException(messages);
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
```
