import { NextRequest, NextResponse } from 'next/server';
import { query, generateId } from '@/lib/db';
import { requireAdmin, dbError } from '@/lib/adminAuth';
import { parseCategoryBody } from '@/lib/adminFields';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(
      await query(`
        SELECT c.*, (SELECT count(*)::int FROM "Product" p WHERE p."categoryId" = c.id) AS "productCount"
        FROM "Category" c ORDER BY c.name ASC`),
    );
  } catch (err) {
    return dbError(err, 'Failed to fetch categories.');
  }
}

export async function POST(req: NextRequest) {
  const who = await requireAdmin(req, 'MANAGER');
  if (who instanceof NextResponse) return who;

  let c: ReturnType<typeof parseCategoryBody>;
  try {
    c = parseCategoryBody(await req.json());
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message }, { status: 400 });
  }
  try {
    const [row] = await query(
      `INSERT INTO "Category" (id, name, slug, "parentId", "isFeaturedCollection")
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [generateId(), c.name, c.slug, c.parentId ?? null, c.isFeaturedCollection ?? false],
    );
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    return dbError(err, 'Failed to create category.');
  }
}
