import { NextRequest, NextResponse } from 'next/server';
import { query, generateId } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const categories = await query(`
      SELECT c.*,
             (SELECT count(*)::int FROM "Product" p WHERE p."categoryId" = c.id) as "productCount"
      FROM "Category" c
      ORDER BY c.name ASC
    `);

    return NextResponse.json(categories);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, slug, parentId, isFeaturedCollection } = body;

    if (!name || !slug) {
      return NextResponse.json({ message: 'Name and slug are required' }, { status: 400 });
    }

    const id = generateId();
    const rows = await query(`
      INSERT INTO "Category" (id, name, slug, "parentId", "isFeaturedCollection")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [id, name, slug, parentId || null, Boolean(isFeaturedCollection)]);

    return NextResponse.json(rows[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to create category' }, { status: 500 });
  }
}
