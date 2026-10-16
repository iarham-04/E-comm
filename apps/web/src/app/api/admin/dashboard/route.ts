import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const [pCount, oCount, uCount, rev, lowStock, recentOrders] = await Promise.all([
      query(`SELECT count(*)::int as count FROM "Product"`),
      query(`SELECT count(*)::int as count FROM "Order"`),
      query(`SELECT count(*)::int as count FROM "User"`),
      query(`SELECT COALESCE(SUM(total), 0)::float as revenue FROM "Order" WHERE status IN ('PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED')`),
      query(`SELECT id, name, slug, stock, price FROM "Product" WHERE stock <= 5 ORDER BY stock ASC LIMIT 5`),
      query(`
        SELECT o.id, o.total, o.status, o."createdAt",
               json_build_object('name', u.name, 'email', u.email) as user
        FROM "Order" o
        LEFT JOIN "User" u ON o."userId" = u.id
        ORDER BY o."createdAt" DESC
        LIMIT 5
      `),
    ]);

    return NextResponse.json({
      totalRevenue: rev[0]?.revenue || 0,
      totalOrders: oCount[0]?.count || 0,
      totalProducts: pCount[0]?.count || 0,
      totalCustomers: uCount[0]?.count || 0,
      recentOrders,
      lowStockProducts: lowStock,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
