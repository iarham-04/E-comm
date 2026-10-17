import 'server-only';
import * as crypto from 'crypto';

/**
 * Master-PIN admin sessions: `pin.<base64url payload>.<base64url HMAC-SHA256>`.
 * Signed with ADMIN_SESSION_SECRET; the NestJS API verifies the same format with the same secret.
 */
export interface PinSession {
  name: string;
  role: 'OWNER';
  exp: number; // epoch ms
}

export const PIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('ADMIN_SESSION_SECRET must be set (32+ characters).');
  return s;
}

const sign = (payload: string) => crypto.createHmac('sha256', secret()).update(payload).digest('base64url');

/** Constant-time string equality that does not leak length via early exit. */
export function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb) && a.length === b.length;
}

export function createPinSession(name: string): { token: string; session: PinSession } {
  const session: PinSession = { name: name.slice(0, 60) || 'Store Administrator', role: 'OWNER', exp: Date.now() + PIN_SESSION_TTL_MS };
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  return { token: `pin.${payload}.${sign(payload)}`, session };
}

export function verifyPinSession(token: string | null | undefined): PinSession | null {
  if (!token?.startsWith('pin.')) return null;
  const [, payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  try {
    if (!safeEqual(sign(payload), sig)) return null;
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as PinSession;
    return session.role === 'OWNER' && session.exp > Date.now() ? session : null;
  } catch {
    return null;
  }
}
