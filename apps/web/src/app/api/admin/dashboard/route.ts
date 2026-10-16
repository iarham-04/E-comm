import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const [totalProducts, totalOrders, totalUsers, lowStockProducts, recentOrders] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.product.findMany({
        where: { stock: { lte: 5 } },
        take: 5,
        orderBy: { stock: 'asc' },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

    const revenueResult = await prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'] },
      },
    });

    return NextResponse.json({
      totalRevenue: Number(revenueResult._sum.total || 0),
      totalOrders,
      totalProducts,
      totalCustomers: totalUsers,
      recentOrders,
      lowStockProducts,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
