# Question 3: What are Controllers in NestJS? How do you handle different HTTP methods?

## Answer

Controllers are responsible for handling incoming requests and returning responses to the client. They define routes and map them to handler methods using decorators.

## HTTP Method Decorators:

- `@Get()` - GET requests
- `@Post()` - POST requests
- `@Put()` - PUT requests
- `@Patch()` - PATCH requests
- `@Delete()` - DELETE requests
- `@All()` - All HTTP methods

## Example:

```typescript
// products.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query('limit') limit?: number) {
    return this.productsService.findAll(limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  create(@Body() createProductDto: any) {
    return this.productsService.create(createProductDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductDto: any) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
```
