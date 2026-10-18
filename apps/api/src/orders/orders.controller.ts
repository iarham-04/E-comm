import { Controller, Post, Get, Body, Query, Param, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { OrdersService, OrderInput } from './orders.service';
import { PaymentService } from './payment.service';
import { AuthGuard } from '../auth/auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { getClerkId } from '../auth/clerk-user';
import { CreateOrderApiDto, RazorpayVerifyApiDto } from '../common/dto/api-contract.dto';

@Controller('orders')
@Throttle({ default: { limit: 20, ttl: 60000 } })
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly paymentService: PaymentService,
    private readonly prisma: PrismaService,
  ) {}

  /** The signed-in DB user, if any. Guests resolve to null. */
  private async currentUser(req: any) {
    const clerkId = getClerkId(req);
    return clerkId ? this.prisma.user.findUnique({ where: { clerkId } }) : null;
  }

  private async withBuyer(dto: CreateOrderApiDto, req: any): Promise<OrderInput> {
    const user = await this.currentUser(req);
    if (!user && !dto.guestEmail) {
      throw new BadRequestException('Please provide a contact email to complete your order.');
    }
    return { ...dto, userId: user?.id };
  }

  /** Reject legacy direct checkout requests; all new orders use Razorpay. */
  @Post()
  create() {
    throw new BadRequestException('Please pay online using Razorpay to place your order.');
  }

  // ─── Razorpay step 1: price the cart server-side and open a gateway order ──
  @Post('razorpay/create-order')
  async createRazorpayOrder(@Body() dto: CreateOrderApiDto, @Req() req: any) {
    const input = await this.withBuyer({ ...dto, paymentMethod: 'RAZORPAY' }, req);
    const quote = await this.ordersService.quote(input);
    const rzp = await this.paymentService.createRazorpayOrder(quote.total, `rcpt_${Date.now()}`);
    const order = await this.ordersService.createPendingRazorpayOrder(input, quote, rzp.id);
    return { ...rzp, orderId: order.id, total: quote.total };
  }

  // ─── Razorpay step 2: verify the checkout signature and confirm ────────────
  @Post('razorpay/verify')
  async verifyAndConfirmOrder(@Body() body: RazorpayVerifyApiDto) {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;
    if (!this.paymentService.verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
      throw new BadRequestException('Payment signature verification failed. Order rejected.');
    }
    const order = await this.ordersService.confirmRazorpayPayment(razorpayOrderId, razorpayPaymentId);
    if (!order) throw new BadRequestException('No pending order matches this payment. Please contact support.');
    return { id: order.id, status: order.status, paymentStatus: order.paymentStatus };
  }

  @Get('my-orders')
  @UseGuards(AuthGuard)
  findMyOrders(@Req() req: any) {
    return this.ordersService.findMyOrders(req.dbUser.id);
  }

  /** Requires both order ID and the matching email. */
  @Get('track')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  trackOrder(@Query('id') id: string, @Query('email') email: string) {
    if (!id || !email) throw new BadRequestException('Both order ID and email are required for tracking.');
    return this.ordersService.trackOrder(id, email);
  }

  /** Order receipt for the confirmation page: owner, staff, or matching email only. */
  @Get(':id')
  async getOrderById(@Param('id') id: string, @Query('email') email: string, @Req() req: any) {
    const user = await this.currentUser(req);
    return this.ordersService.findOneSecure(id, user, email || '');
  }
}
