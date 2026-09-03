import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from './auth/auth.guard';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}

  @Get('health')
  getHealth() {
    return { status: 'ok' };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@Req() req: any) {
    return { user: req.dbUser };
  }

  @Get('homepage-banners')
  async getPublicBanners() {
    const now = new Date();
    return this.prisma.homepageBanner.findMany({
      where: {
        isActive: true,
        OR: [
          { startsAt: null, endsAt: null },
          { startsAt: { lte: now }, endsAt: { gte: now } },
          { startsAt: { lte: now }, endsAt: null },
        ],
      },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
