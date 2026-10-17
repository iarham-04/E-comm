import * as crypto from 'crypto';
import { UserRole } from '@prisma/client';

/**
 * Verifies master-PIN admin tokens issued by the web app (`apps/web/src/lib/adminSession.ts`):
 * `pin.<base64url JSON payload>.<base64url HMAC-SHA256>` signed with the shared ADMIN_SESSION_SECRET.
 */
export function verifyPinSession(token: string | undefined): { name: string; role: UserRole } | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32 || !token?.startsWith('pin.')) return null;

  const [, payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return session?.role === UserRole.OWNER && session.exp > Date.now()
      ? { name: String(session.name || 'Store Administrator'), role: UserRole.OWNER }
      : null;
  } catch {
    return null;
  }
}

/** Synthetic user attached to requests authenticated by a master-PIN session. */
export const masterPinUser = (name: string) => ({
  id: 'admin-master',
  clerkId: 'admin-master',
  email: '',
  name,
  role: UserRole.OWNER,
});
