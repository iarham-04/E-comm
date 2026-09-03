import { Controller, Post, Get, Body, Query, UseGuards, Req } from '@nestjs/common';
import { OrdersService, CreateOrderDto } from './orders.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get('track')
  trackOrder(@Query('id') id: string, @Query('email') email: string) {
    return this.ordersService.trackOrder(id, email);
  }

  @Get('my-orders')
  @UseGuards(AuthGuard)
  findMyOrders(@Req() req: any) {
    return this.ordersService.findMyOrders(req.dbUser.id);
  }
}
