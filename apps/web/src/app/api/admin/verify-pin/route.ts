import { NextRequest, NextResponse } from 'next/server';
import { createPinSession, safeEqual } from '@/lib/adminSession';

export const dynamic = 'force-dynamic';

// Per-instance brute-force throttle: 5 failures per IP per 15 minutes.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const failures = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: NextRequest) {
  // Tolerate whitespace/quotes picked up when the value was pasted into the hosting dashboard
  const masterPin = process.env.ADMIN_MASTER_PIN?.trim().replace(/^(['"])(.*)\1$/, '$2');
  if (!masterPin || masterPin.length < 8 || !process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ message: 'Master PIN login is not configured.' }, { status: 503 });
  }

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const record = failures.get(ip);
  if (record && record.resetAt > now && record.count >= MAX_FAILURES) {
    const minutes = Math.ceil((record.resetAt - now) / 60000);
    return NextResponse.json({ message: `Too many attempts. Try again in ${minutes} minute(s).` }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const pin = typeof body?.pin === 'string' ? body.pin.trim() : '';
  const identifier = typeof body?.identifier === 'string' ? body.identifier.trim() : '';

  if (!pin || !safeEqual(pin, masterPin)) {
    const fresh = !record || record.resetAt <= now;
    failures.set(ip, { count: fresh ? 1 : record!.count + 1, resetAt: fresh ? now + WINDOW_MS : record!.resetAt });
    await new Promise((r) => setTimeout(r, 500)); // slow down guessing
    return NextResponse.json({ message: 'Invalid security key / passcode. Access denied.' }, { status: 401 });
  }

  failures.delete(ip);
  const { token, session } = createPinSession(identifier);
  return NextResponse.json({
    token,
    role: session.role,
    expiresAt: session.exp,
    user: { name: session.name, email: '' },
  });
}
