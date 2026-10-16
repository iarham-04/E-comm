import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: 'admin-master',
      clerkId: 'admin-master',
      email: auth.email,
      name: auth.name,
      role: auth.role,
    },
  });
}
