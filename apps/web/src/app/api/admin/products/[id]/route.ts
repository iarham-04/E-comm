import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const rows = await query(`
      SELECT p.*,
             json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) as category,
             COALESCE(
               (SELECT json_agg(v.*) FROM "ProductVariant" v WHERE v."productId" = p.id),
               '[]'::json
             ) as variants
      FROM "Product" p
      LEFT JOIN "Category" c ON p."categoryId" = c.id
      WHERE p.id = $1
    `, [params.id]);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const existing = await query(`SELECT * FROM "Product" WHERE id = $1`, [params.id]);
    if (existing.length === 0) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const current = existing[0];
    const updated = await query(`
      UPDATE "Product" SET
        name = COALESCE($2, name),
        slug = COALESCE($3, slug),
        description = COALESCE($4, description),
        price = COALESCE($5, price),
        "categoryId" = COALESCE($6, "categoryId"),
        images = COALESCE($7, images),
        stock = COALESCE($8, stock),
        "isActive" = COALESCE($9, "isActive"),
        status = COALESCE($10, status),
        "updatedAt" = NOW()
      WHERE id = $1
      RETURNING *
    `, [
      params.id,
      body.name !== undefined ? body.name : null,
      body.slug !== undefined ? body.slug : null,
      body.description !== undefined ? body.description : null,
      body.price !== undefined ? Number(body.price) : null,
      body.categoryId !== undefined ? body.categoryId : null,
      body.images !== undefined ? body.images : null,
      body.stock !== undefined ? Number(body.stock) : null,
      body.isActive !== undefined ? Boolean(body.isActive) : null,
      body.status !== undefined ? body.status : null,
    ]);

    return NextResponse.json(updated[0]);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  try {
    await query(`DELETE FROM "Product" WHERE id = $1`, [params.id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to delete product' }, { status: 500 });
  }
}
