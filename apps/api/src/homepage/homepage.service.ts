import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HomepageService {
  constructor(private prisma: PrismaService) {}

  async getHomepageData() {
    const announcement = '⚡ FREE WORLDWIDE EXPRESS SHIPPING ON ORDERS OVER ₹1,999';

    const categories = await this.prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
    });

    const bestSellers = await this.prisma.product.findMany({
      where: { isActive: true },
      take: 4,
      orderBy: { reviews: { _count: 'desc' } },
      include: { category: true },
    });

    const newArrivals = await this.prisma.product.findMany({
      where: { isActive: true },
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });

    return {
      announcement,
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        count: c._count.products,
      })),
      bestSellers,
      newArrivals,
    };
  }

  async subscribeNewsletter(email: string) {
    if (!email || !email.includes('@')) {
      throw new BadRequestException('A valid email address is required.');
    }

    return this.prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { isActive: true },
      create: { email },
    });
  }
}
