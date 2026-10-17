import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query } from './db';
import { verifyPinSession } from './adminSession';

export type StaffRole = 'SUPPORT' | 'MANAGER' | 'OWNER';
const LEVEL: Record<string, number> = { CUSTOMER: 1, SUPPORT: 2, MANAGER: 3, OWNER: 4 };

export interface AdminIdentity {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  role: StaffRole;
}

/**
 * Identifies the caller from a signed master-PIN token or a Clerk session whose DB role is staff.
 * Nothing the client asserts (names, emails, roles) is trusted.
 */
export async function getAdminIdentity(req: NextRequest): Promise<AdminIdentity | null> {
  const pin = verifyPinSession(req.headers.get('x-admin-token'));
  if (pin) {
    return { id: 'admin-master', clerkId: 'admin-master', email: '', name: pin.name, role: 'OWNER' };
  }

  const { userId } = await auth();
  if (!userId) return null;
  const [user] = await query<AdminIdentity>(
    `SELECT id, "clerkId", email, name, role FROM "User" WHERE "clerkId" = $1`,
    [userId],
  );
  return user && LEVEL[user.role] >= LEVEL.SUPPORT ? user : null;
}

/**
 * Route guard: returns the identity, or a 401/403 response to send back.
 * Usage: `const who = await requireAdmin(req, 'MANAGER'); if (who instanceof NextResponse) return who;`
 */
export async function requireAdmin(req: NextRequest, minRole: StaffRole = 'SUPPORT'): Promise<AdminIdentity | NextResponse> {
  const identity = await getAdminIdentity(req).catch(() => null);
  if (!identity) return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  if (LEVEL[identity.role] < LEVEL[minRole]) {
    return NextResponse.json({ message: `Requires ${minRole} role or higher.` }, { status: 403 });
  }
  return identity;
}

/** Turns DB errors into safe client messages without leaking SQL details. */
export function dbError(err: any, fallback: string): NextResponse {
  if (err?.code === '23505') return NextResponse.json({ message: 'That slug or name is already in use.' }, { status: 409 });
  if (err?.code === '23503') {
    return NextResponse.json({ message: 'This record is referenced by other data and cannot be removed.' }, { status: 409 });
  }
  console.error(fallback, err);
  return NextResponse.json({ message: fallback }, { status: 500 });
}
