import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const who = await requireAdmin(req);
  if (who instanceof NextResponse) return who;
  return NextResponse.json({ user: who });
}
