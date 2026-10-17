import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin, dbError } from '@/lib/adminAuth';
import { parseProductBody, col, PRODUCT_SELECT } from '@/lib/adminFields';

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };
const notFound = () => NextResponse.json({ message: 'Product not found.' }, { status: 404 });

export async function GET(req: NextRequest, { params }: Ctx) {
  const who = await requireAdmin(req, 'MANAGER');
  if (who instanceof NextResponse) return who;
  try {
    const [row] = await query(`${PRODUCT_SELECT} WHERE p.id = $1`, [params.id]);
    return row ? NextResponse.json(row) : notFound();
  } catch (err) {
    return dbError(err, 'Failed to fetch product.');
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const who = await requireAdmin(req, 'MANAGER');
  if (who instanceof NextResponse) return who;

  let fields: Record<string, any>;
  try {
    fields = parseProductBody(await req.json());
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message }, { status: 400 });
  }
  const keys = Object.keys(fields);
  if (!keys.length) return NextResponse.json({ message: 'Nothing to update.' }, { status: 400 });

  try {
    const [row] = await query(
      `UPDATE "Product" SET ${keys.map((k, i) => `${col(k)} = $${i + 2}`).join(', ')}, "updatedAt" = NOW()
       WHERE id = $1 RETURNING *`,
      [params.id, ...keys.map((k) => fields[k])],
    );
    return row ? NextResponse.json(row) : notFound();
  } catch (err) {
    return dbError(err, 'Failed to update product.');
  }
}

/** Soft delete: past orders reference products, so the row is hidden rather than removed. */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const who = await requireAdmin(req, 'MANAGER');
  if (who instanceof NextResponse) return who;
  try {
    const [row] = await query(
      `UPDATE "Product" SET "isActive" = false, "updatedAt" = NOW() WHERE id = $1 RETURNING id`,
      [params.id],
    );
    return row ? NextResponse.json({ success: true, id: row.id }) : notFound();
  } catch (err) {
    return dbError(err, 'Failed to delete product.');
  }
}
