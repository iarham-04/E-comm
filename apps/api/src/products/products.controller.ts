import { Controller, Get, Post, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(
    @Query('search')          search?: string,
    @Query('category')        category?: string,
    @Query('material')        material?: string,
    @Query('minPrice')        minPrice?: number,
    @Query('maxPrice')        maxPrice?: number,
    @Query('isLimitedEdition') isLimitedEdition?: string,
    @Query('sort')            sort?: string,
    @Query('page')            page?: number,
    @Query('limit')           limit?: number,
  ) {
    return this.productsService.findAll({
      search, category, material, minPrice, maxPrice, isLimitedEdition, sort, page, limit,
    });
  }

  @Get('suggest')
  suggest(@Query('q') q: string) {
    return this.productsService.suggest(q);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Post(':id/reviews')
  @UseGuards(AuthGuard)
  addReview(
    @Param('id') productId: string,
    @Body() body: { rating: number; comment?: string },
    @Req() req: any,
  ) {
    return this.productsService.addReview(productId, {
      rating: body.rating,
      comment: body.comment,
      userId: req.dbUser.id,
    });
  }
}

@Controller('categories')
export class CategoriesController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  getAll() { return this.productsService.getCategories(); }
}
