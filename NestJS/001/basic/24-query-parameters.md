# Question 24: How do you handle query parameters and pagination in NestJS?

## Answer

Query parameters are extracted using `@Query()` decorator. Pagination is commonly implemented using query parameters.

## Example:

```typescript
// users.controller.ts
import {
  Controller,
  Get,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  ParseBoolPipe,
} from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('sort') sort?: string,
    @Query('order', new DefaultValuePipe('asc')) order?: 'asc' | 'desc',
    @Query('search') search?: string,
    @Query('active', new DefaultValuePipe(true), ParseBoolPipe) active?: boolean,
  ) {
    return {
      page,
      limit,
      sort,
      order,
      search,
      active,
    };
  }

  // All query parameters as object
  @Get('filter')
  filter(@Query() query: Record<string, any>) {
    return query;
  }

  // Specific query parameters
  @Get('search')
  search(
    @Query('q') query: string,
    @Query('category') category?: string,
  ) {
    return { query, category };
  }
}

// pagination.dto.ts
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  sort?: string;

  @IsOptional()
  order?: 'asc' | 'desc' = 'asc';
}

// users.service.ts
@Injectable()
export class UsersService {
  async findAllPaginated(dto: PaginationDto) {
    const { page = 1, limit = 10 } = dto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      skip,
      take: limit,
      order: dto.sort ? { [dto.sort]: dto.order } : undefined,
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
```
