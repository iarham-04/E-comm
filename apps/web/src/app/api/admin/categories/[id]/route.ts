import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin, dbError } from '@/lib/adminAuth';
import { parseCategoryBody } from '@/lib/adminFields';

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };
const notFound = () => NextResponse.json({ message: 'Category not found.' }, { status: 404 });

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const who = await requireAdmin(req, 'MANAGER');
  if (who instanceof NextResponse) return who;

  let c: ReturnType<typeof parseCategoryBody>;
  try {
    c = parseCategoryBody(await req.json(), true);
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message }, { status: 400 });
  }
  if (c.parentId === params.id) return NextResponse.json({ message: 'A category cannot be its own parent.' }, { status: 400 });

  const fields = Object.entries(c).filter(([, v]) => v !== undefined);
  if (!fields.length) return NextResponse.json({ message: 'Nothing to update.' }, { status: 400 });
  try {
    const [row] = await query(
      `UPDATE "Category" SET ${fields.map(([k], i) => `"${k}" = $${i + 2}`).join(', ')} WHERE id = $1 RETURNING *`,
      [params.id, ...fields.map(([, v]) => v)],
    );
    return row ? NextResponse.json(row) : notFound();
  } catch (err) {
    return dbError(err, 'Failed to update category.');
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const who = await requireAdmin(req, 'MANAGER');
  if (who instanceof NextResponse) return who;
  try {
    const [row] = await query(`DELETE FROM "Category" WHERE id = $1 RETURNING id`, [params.id]);
    return row ? NextResponse.json({ success: true }) : notFound();
  } catch (err) {
    return dbError(err, 'Failed to delete category.'); // FK violation → 409 "still has products"
  }
}
