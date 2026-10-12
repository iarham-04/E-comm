import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { OrdersService, CreateOrderDto } from './orders.service';
import { PaymentService } from './payment.service';
import { AuthGuard } from '../auth/auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { getAuth } from '@clerk/express';

export interface RazorpayCreateOrderDto {
  amountInRupees: number;
  receiptId?: string;
}

export interface RazorpayVerifyDto {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  order: CreateOrderDto;
}

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly paymentService: PaymentService,
    private readonly prisma: PrismaService,
  ) {}

  // ─── Standard Order Creation (COD) ─────────────────────────────────────────
  // Supports both logged-in users (tied to user account) and guest checkout (with email)
  @Post()
  async create(@Body() dto: CreateOrderDto, @Req() req: any) {
    let userId: string | undefined;

    try {
      const auth = getAuth(req);
      if (auth && auth.userId) {
        const user = await this.prisma.user.findUnique({
          where: { clerkId: auth.userId },
        });
        if (user) userId = user.id;
      }
    } catch {
      // Unauthenticated / guest session
    }

    if (!userId && !dto.guestEmail) {
      throw new BadRequestException('Please provide a contact email to complete your order.');
    }

    return this.ordersService.create({
      ...dto,
      ...(userId ? { userId } : {}),
    });
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
  async verifyAndCreateOrder(@Body() body: RazorpayVerifyDto, @Req() req: any) {
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

    let userId: string | undefined;
    try {
      const auth = getAuth(req);
      if (auth && auth.userId) {
        const user = await this.prisma.user.findUnique({
          where: { clerkId: auth.userId },
        });
        if (user) userId = user.id;
      }
    } catch {
      // Unauthenticated / guest session
    }

    const dbOrder = await this.ordersService.create({
      ...order,
      ...(userId ? { userId } : {}),
      paymentMethod: 'RAZORPAY',
      razorpayPaymentId,
      razorpayOrderId,
    });

    return dbOrder;
  }

  // ─── Authenticated: My Orders (MUST be before :id to avoid route shadowing) ─
  @Get('my-orders')
  @UseGuards(AuthGuard)
  findMyOrders(@Req() req: any) {
    return this.ordersService.findMyOrders(req.dbUser.id);
  }

  // ─── Order Tracking (requires both order ID + email for verification) ──────
  @Get('track')
  trackOrder(@Query('id') id: string, @Query('email') email: string) {
    if (!id || !email) {
      throw new BadRequestException('Both order ID and email are required for tracking.');
    }
    return this.ordersService.trackOrder(id, email);
  }

  // ─── Order Receipt / Confirmation (rendered on order-confirmation/[id]) ───
  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }
}
