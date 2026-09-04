import { Controller, Post, Get, Body, Query, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { OrdersService, CreateOrderDto } from './orders.service';
import { PaymentService } from './payment.service';
import { AuthGuard } from '../auth/auth.guard';

export interface RazorpayCreateOrderDto {
  amountInRupees: number;
  receiptId?: string;
}

export interface RazorpayVerifyDto {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  // Full order DTO to create the order in DB after verification
  order: CreateOrderDto;
}

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly paymentService: PaymentService,
  ) {}

  // ─── Standard Order Creation (COD) ─────────────────────────────────────────
  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  // ─── Razorpay: Step 1 — Create a Razorpay Order (before showing popup) ────
  @Post('razorpay/create-order')
  async createRazorpayOrder(@Body() body: RazorpayCreateOrderDto) {
    const { amountInRupees, receiptId } = body;
    if (!amountInRupees || amountInRupees <= 0) {
      throw new BadRequestException('Invalid order amount.');
    }
    const receipt = receiptId || `rcpt_${Date.now()}`;
    return this.paymentService.createRazorpayOrder(amountInRupees, receipt);
  }

  // ─── Razorpay: Step 2 — Verify Payment & Create Order in DB ───────────────
  @Post('razorpay/verify')
  async verifyAndCreateOrder(@Body() body: RazorpayVerifyDto) {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, order } = body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw new BadRequestException('Missing Razorpay payment verification parameters.');
    }

    // Verify HMAC signature — rejects tampered / fraudulent payments
    const isValid = this.paymentService.verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    );

    if (!isValid) {
      throw new BadRequestException('Payment signature verification failed. Order rejected.');
    }

    // Signature verified — create order in DB with PAID status
    const dbOrder = await this.ordersService.create({
      ...order,
      paymentMethod: 'RAZORPAY',
      razorpayPaymentId,
      razorpayOrderId,
    });

    return dbOrder;
  }

  // ─── Order Tracking ────────────────────────────────────────────────────────
  @Get('track')
  trackOrder(@Query('id') id: string, @Query('email') email: string) {
    return this.ordersService.trackOrder(id, email);
  }

  // ─── Authenticated: My Orders ──────────────────────────────────────────────
  @Get('my-orders')
  @UseGuards(AuthGuard)
  findMyOrders(@Req() req: any) {
    return this.ordersService.findMyOrders(req.dbUser.id);
  }
}
