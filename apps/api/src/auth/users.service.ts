import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateUser(clerkId: string, email: string, name?: string) {
    const existing = await this.prisma.user.findUnique({ where: { clerkId } });
    if (existing) {
      return existing;
    }

    return this.prisma.user.create({
      data: {
        clerkId,
        email,
        name: name || email.split('@')[0],
      },
    });
  }

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { items: { include: { product: true } } },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User #${userId} not found.`);
    }

    return user;
  }
}
