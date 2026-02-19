# Question 32: What are advanced validation techniques using class-validator?

## Answer

class-validator provides many decorators for complex validation scenarios including conditional validation, custom validators, and validation groups.

## Example:

```typescript
// create-user.dto.ts
import {
  IsString,
  IsEmail,
  IsOptional,
  ValidateIf,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
  IsNumber,
  Min,
  Max,
  ArrayMinSize,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @Matches(/^\d{5}$/)
  zipCode: string;
}

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  password: string;

  @IsOptional()
  @IsNumber()
  @Min(18)
  @Max(120)
  age?: number;

  @IsEnum(UserRole)
  role: UserRole;

  // Conditional validation
  @ValidateIf((o) => o.role === UserRole.ADMIN)
  @IsString()
  @IsNotEmpty()
  adminKey?: string;

  // Nested validation
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  // Array validation
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  tags: string[];
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
          const hasUpper = /[A-Z]/.test(value);
          const hasLower = /[a-z]/.test(value);
          const hasNumber = /\d/.test(value);
          const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
          return hasUpper && hasLower && hasNumber && hasSpecial;
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

// Validation groups
export class UpdateUserDto {
  @IsString({ groups: ['name'] })
  name?: string;

  @IsEmail({}, { groups: ['email'] })
  email?: string;
}

// Usage in controller
@Put(':id')
update(
  @Param('id') id: string,
  @Body(new ValidationPipe({ groups: ['name', 'email'] })) dto: UpdateUserDto,
) {
  return this.usersService.update(id, dto);
}
```
