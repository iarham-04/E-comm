import { Injectable } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const LIVE = { isActive: true, status: ProductStatus.PUBLISHED };

@Injectable()
export class HomepageService {
  constructor(private prisma: PrismaService) {}

  async getHomepageData() {
    const [categories, bestSellers, newArrivals] = await Promise.all([
      this.prisma.category.findMany({ include: { _count: { select: { products: { where: LIVE } } } } }),
      this.prisma.product.findMany({
        where: LIVE, take: 4, orderBy: { reviews: { _count: 'desc' } }, include: { category: true },
      }),
      this.prisma.product.findMany({
        where: LIVE, take: 4, orderBy: { createdAt: 'desc' }, include: { category: true },
      }),
    ]);

    return {
      announcement: '🌰 FREE SHIPPING ACROSS INDIA ON ORDERS OVER ₹1,999',
      categories: categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, count: c._count.products })),
      bestSellers,
      newArrivals,
    };
  }

  async subscribeNewsletter(rawEmail: string) {
    const email = rawEmail.trim().toLowerCase();
    await this.prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { isActive: true },
      create: { email },
    });
    return { success: true };
  }
}
