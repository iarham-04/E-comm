import {
  Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { RolesGuard } from '../auth/roles.guard';
import { RequireRole } from '../auth/roles.decorator';
import { UserRole, OrderStatus } from '@prisma/client';
import { CreateProductDto, UpdateProductDto, CreateCategoryDto, UpdateCategoryDto, BulkStockItemDto } from '../common/dto/product.dto';

@Controller('admin')
@UseGuards(RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── Master PIN Authentication ────────────────────────────────────────────
  @Post('verify-pin')
  verifyPin(@Body('pin') pin: string, @Body('identifier') identifier?: string) {
    return this.adminService.verifyPin(pin, identifier);
  }

  // ─── Telemetry ────────────────────────────────────────────────────────────
  @Post('telemetry')
  logTelemetry(@Body('event') event: string, @Body('payload') payload?: any) {
    return this.adminService.logTelemetry(event, payload);
  }

  // ─── Dashboard & Analytics ────────────────────────────────────────────────
  @Get('dashboard')
  @RequireRole(UserRole.SUPPORT)
  getDashboard() { return this.adminService.getDashboard(); }

  @Get('analytics')
  @RequireRole(UserRole.MANAGER)
  getAnalytics() { return this.adminService.getAnalytics(); }

  // ─── User & Role Management (Owner-only) ───────────────────────────────────
  @Get('users')
  @RequireRole(UserRole.OWNER)
  getUsers() {
    return this.adminService.getUsers();
  }

  @Patch('users/:id/role')
  @RequireRole(UserRole.OWNER)
  updateUserRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.adminService.updateUserRole(id, role);
  }

  @Patch('customers/:id/notes')
  @RequireRole(UserRole.OWNER)
  updateCustomerNotes(@Param('id') id: string, @Body('notes') notes: string) {
    return this.adminService.updateCustomerNotes(id, notes);
  }

  // ─── Category Management (Manager+) ───────────────────────────────────────
  @Get('categories')
  @RequireRole(UserRole.MANAGER)
  getCategories() { return this.adminService.getCategories(); }

  @Post('categories')
  @RequireRole(UserRole.MANAGER)
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.adminService.createCategory(dto);
  }

  @Patch('categories/:id')
  @RequireRole(UserRole.MANAGER)
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.adminService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @RequireRole(UserRole.MANAGER)
  deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }

  // ─── Product Management (Manager+) ────────────────────────────────────────
  @Get('products')
  @RequireRole(UserRole.MANAGER)
  getAllProducts() { return this.adminService.getAllProducts(); }

  @Get('products/:id')
  @RequireRole(UserRole.MANAGER)
  getProduct(@Param('id') id: string) { return this.adminService.getProductById(id); }

  @Post('products')
  @RequireRole(UserRole.MANAGER)
  createProduct(@Body() dto: CreateProductDto) {
    return this.adminService.createProduct(dto);
  }

  @Patch('products/bulk-stock')
  @RequireRole(UserRole.MANAGER)
  bulkUpdateStock(@Body('items') items: BulkStockItemDto[]) {
    return this.adminService.bulkUpdateStock(items);
  }

  @Post('products/:id/duplicate')
  @RequireRole(UserRole.MANAGER)
  duplicateProduct(@Param('id') id: string) {
    return this.adminService.duplicateProduct(id);
  }

  @Patch('products/:id')
  @RequireRole(UserRole.MANAGER)
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.adminService.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @RequireRole(UserRole.MANAGER)
  deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }

  @Patch('products/:id/stock')
  @RequireRole(UserRole.MANAGER)
  updateStock(@Param('id') id: string, @Body('stock') stock: number) {
    return this.adminService.updateStock(id, stock);
  }

  @Post('products/reindex')
  @RequireRole(UserRole.MANAGER)
  reindexAll() { return this.adminService.reindexAll(); }

  // ─── Order Management (Support-level & Manager-level) ─────────────────────
  @Get('orders')
  @RequireRole(UserRole.SUPPORT)
  getAllOrders() { return this.adminService.getAllOrders(); }

  @Patch('orders/:id/status')
  @RequireRole(UserRole.SUPPORT)
  updateOrderStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
    return this.adminService.updateOrderStatus(id, status);
  }

  @Patch('orders/:id/tracking')
  @RequireRole(UserRole.SUPPORT)
  updateOrderTracking(@Param('id') id: string, @Body('trackingNumber') trackingNumber: string, @Body('carrier') carrier: string) {
    return this.adminService.updateOrderTracking(id, trackingNumber, carrier);
  }

  @Get('orders/:id/invoice')
  @RequireRole(UserRole.SUPPORT)
  getOrderInvoice(@Param('id') id: string) {
    return this.adminService.getOrderInvoice(id);
  }

  @Patch('orders/:id/refund')
  @RequireRole(UserRole.MANAGER)
  refundOrder(@Param('id') id: string, @Body('refundAmount') refundAmount: number, @Body('refundReason') refundReason: string) {
    return this.adminService.refundOrder(id, refundAmount, refundReason);
  }

  // ─── Coupons & Collection Sales (Manager+) ────────────────────────────────
  @Get('coupons')
  @RequireRole(UserRole.MANAGER)
  getCoupons() { return this.adminService.getCoupons(); }

  @Post('coupons')
  @RequireRole(UserRole.MANAGER)
  createCoupon(@Body() dto: any) { return this.adminService.createCoupon(dto); }

  @Patch('coupons/:id')
  @RequireRole(UserRole.MANAGER)
  updateCoupon(@Param('id') id: string, @Body() dto: any) { return this.adminService.updateCoupon(id, dto); }

  @Delete('coupons/:id')
  @RequireRole(UserRole.MANAGER)
  deleteCoupon(@Param('id') id: string) { return this.adminService.deleteCoupon(id); }

  // ─── Homepage Banners (Manager+) ──────────────────────────────────────────
  @Get('banners')
  @RequireRole(UserRole.MANAGER)
  getBanners() { return this.adminService.getBanners(); }

  @Post('banners')
  @RequireRole(UserRole.MANAGER)
  createBanner(@Body() dto: any) { return this.adminService.createBanner(dto); }

  @Patch('banners/:id')
  @RequireRole(UserRole.MANAGER)
  updateBanner(@Param('id') id: string, @Body() dto: any) { return this.adminService.updateBanner(id, dto); }

  @Delete('banners/:id')
  @RequireRole(UserRole.MANAGER)
  deleteBanner(@Param('id') id: string) { return this.adminService.deleteBanner(id); }

  // ─── Settings & Email Templates (Owner-only) ──────────────────────────────
  @Get('settings')
  @RequireRole(UserRole.OWNER)
  getSettings() { return this.adminService.getSettings(); }

  @Patch('settings')
  @RequireRole(UserRole.OWNER)
  updateSettings(@Body() dto: any) { return this.adminService.updateSettings(dto); }

  @Get('email-templates')
  @RequireRole(UserRole.OWNER)
  getEmailTemplates() { return this.adminService.getEmailTemplates(); }

  @Patch('email-templates/:id')
  @RequireRole(UserRole.OWNER)
  updateEmailTemplate(@Param('id') id: string, @Body() dto: any) { return this.adminService.updateEmailTemplate(id, dto); }

  // ─── Analytics Reports (Owner-only) ───────────────────────────────────────
  @Get('reports/revenue')
  @RequireRole(UserRole.OWNER)
  getRevenueReport(@Query('from') from?: string, @Query('to') to?: string) {
    return this.adminService.getRevenueReport(from, to);
  }

  @Get('reports/sales-by-product')
  @RequireRole(UserRole.OWNER)
  getSalesByProductReport(@Query('from') from?: string, @Query('to') to?: string) {
    return this.adminService.getSalesByProductReport(from, to);
  }

  @Get('reports/top-categories')
  @RequireRole(UserRole.OWNER)
  getTopCategoriesReport(@Query('from') from?: string, @Query('to') to?: string) {
    return this.adminService.getTopCategoriesReport(from, to);
  }

  @Get('reports/average-order-value')
  @RequireRole(UserRole.OWNER)
  getAovReport(@Query('from') from?: string, @Query('to') to?: string) {
    return this.adminService.getAovReport(from, to);
  }

  @Get('reports/coupon-performance')
  @RequireRole(UserRole.OWNER)
  getCouponPerformanceReport(@Query('from') from?: string, @Query('to') to?: string) {
    return this.adminService.getCouponPerformanceReport(from, to);
  }
}
