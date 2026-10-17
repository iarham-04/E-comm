import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin, dbError } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const who = await requireAdmin(req);
  if (who instanceof NextResponse) return who;

  try {
    const [[counts], lowStockProducts, recentOrders] = await Promise.all([
      query(`
        SELECT (SELECT count(*)::int FROM "Product") AS "totalProducts",
               (SELECT count(*)::int FROM "Order") AS "totalOrders",
               (SELECT count(*)::int FROM "User") AS "totalUsers",
               (SELECT COALESCE(SUM(total), 0)::float FROM "Order" WHERE "paymentStatus" = 'PAID') AS "totalRevenue"`),
      query(`SELECT id, name, slug, stock, price FROM "Product" WHERE stock <= 5 AND "isActive" ORDER BY stock ASC LIMIT 5`),
      query(`
        SELECT o.id, o.total, o.status, o."paymentStatus", o."createdAt",
               json_build_object('name', u.name, 'email', u.email) AS user
        FROM "Order" o LEFT JOIN "User" u ON o."userId" = u.id
        ORDER BY o."createdAt" DESC LIMIT 5`),
    ]);
    return NextResponse.json({ ...counts, lowStockCount: lowStockProducts.length, lowStockProducts, recentOrders });
  } catch (err) {
    return dbError(err, 'Failed to fetch dashboard data.');
  }
}
