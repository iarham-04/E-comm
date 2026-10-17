import { NextRequest, NextResponse } from 'next/server';
import { query, generateId } from '@/lib/db';
import { requireAdmin, dbError } from '@/lib/adminAuth';
import { parseProductBody, col, PRODUCT_SELECT } from '@/lib/adminFields';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const who = await requireAdmin(req, 'MANAGER');
  if (who instanceof NextResponse) return who;
  try {
    return NextResponse.json(await query(`${PRODUCT_SELECT} ORDER BY p."createdAt" DESC`));
  } catch (err) {
    return dbError(err, 'Failed to fetch products.');
  }
}

export async function POST(req: NextRequest) {
  const who = await requireAdmin(req, 'MANAGER');
  if (who instanceof NextResponse) return who;

  let fields: Record<string, any>;
  try {
    fields = parseProductBody(await req.json(), { create: true });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message }, { status: 400 });
  }

  const data = {
    images: [], stock: 0, isActive: true, status: 'DRAFT', isLimitedEdition: false, isGiftEligible: true,
    ...fields,
    id: generateId(),
  };
  const keys = Object.keys(data);
  try {
    const [row] = await query(
      `INSERT INTO "Product" (${keys.map(col).join(', ')}, "createdAt", "updatedAt")
       VALUES (${keys.map((_, i) => `$${i + 1}`).join(', ')}, NOW(), NOW())
       RETURNING *`,
      keys.map((k) => (data as any)[k]),
    );
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    return dbError(err, 'Failed to create product.');
  }
}
