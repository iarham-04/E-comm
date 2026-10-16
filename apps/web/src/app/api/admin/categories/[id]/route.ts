import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

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
    const rows = await query(`
      UPDATE "Category" SET
        name = COALESCE($2, name),
        slug = COALESCE($3, slug),
        "parentId" = COALESCE($4, "parentId"),
        "isFeaturedCollection" = COALESCE($5, "isFeaturedCollection")
      WHERE id = $1
      RETURNING *
    `, [
      params.id,
      body.name || null,
      body.slug || null,
      body.parentId !== undefined ? (body.parentId || null) : null,
      body.isFeaturedCollection !== undefined ? Boolean(body.isFeaturedCollection) : null,
    ]);

    return NextResponse.json(rows[0]);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to update category' }, { status: 500 });
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
    await query(`DELETE FROM "Category" WHERE id = $1`, [params.id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to delete category' }, { status: 500 });
  }
}
