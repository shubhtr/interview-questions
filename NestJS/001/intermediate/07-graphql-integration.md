# Question 27: How do you integrate GraphQL with NestJS?

## Answer

NestJS provides `@nestjs/graphql` package for building GraphQL APIs using either code-first or schema-first approach.

## Example:

```typescript
// Install: npm install @nestjs/graphql @nestjs/apollo graphql apollo-server-express

// app.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
    }),
    UsersModule,
  ],
})
export class AppModule {}

// user.entity.ts (GraphQL Object Type)
import { ObjectType, Field, Int, ID } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => Int, { nullable: true })
  age?: number;

  @Field()
  createdAt: Date;
}

// create-user.input.ts
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  password?: string;

  @Field(() => Int, { nullable: true })
  age?: number;
}

// users.resolver.ts
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.usersService.findOne(id);
  }

  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput);
  }

  @Mutation(() => User)
  updateUser(
    @Args('id', { type: () => String }) id: string,
    @Args('updateUserInput') updateUserInput: CreateUserInput,
  ) {
    return this.usersService.update(id, updateUserInput);
  }

  @Mutation(() => Boolean)
  removeUser(@Args('id', { type: () => String }) id: string) {
    return this.usersService.remove(id);
  }
}

// users.service.ts
import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private users: User[] = [];

  findAll(): User[] {
    return this.users;
  }

  findOne(id: string): User {
    return this.users.find(user => user.id === id);
  }

  create(createUserInput: CreateUserInput): User {
    const user: User = {
      id: Date.now().toString(),
      ...createUserInput,
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  update(id: string, updateUserInput: Partial<CreateUserInput>): User {
    const user = this.findOne(id);
    Object.assign(user, updateUserInput);
    return user;
  }

  remove(id: string): boolean {
    const index = this.users.findIndex(user => user.id === id);
    if (index > -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }
}

// users.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';

@Module({
  providers: [UsersResolver, UsersService],
})
export class UsersModule {}

// Using with subscriptions
// users.resolver.ts (with subscriptions)
import { Subscription } from '@nestjs/graphql';

@Resolver(() => User)
export class UsersResolver {
  @Subscription(() => User)
  userAdded() {
    return this.usersService.userAdded$;
  }
}

// Using with guards
// graphql-auth.guard.ts
import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}

// Usage
@Query(() => [User])
@UseGuards(GqlAuthGuard)
findAll() {
  return this.usersService.findAll();
}
```
