import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { dbError, requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const DEFAULTS = {
  flatShippingFee: 0,
  freeShippingThreshold: 1999,
  taxPercent: 18,
  razorpayEnabled: true,
  codEnabled: false,
};

async function getSettings() {
  const [settings] = await query(
    `INSERT INTO "StoreSettings" (id, "flatShippingFee", "freeShippingThreshold", "taxPercent", "razorpayEnabled", "codEnabled", "updatedAt")
     VALUES ('singleton', $1, $2, $3, $4, $5, NOW())
     ON CONFLICT (id) DO UPDATE SET id = EXCLUDED.id
     RETURNING *`,
    [
      DEFAULTS.flatShippingFee,
      DEFAULTS.freeShippingThreshold,
      DEFAULTS.taxPercent,
      DEFAULTS.razorpayEnabled,
      DEFAULTS.codEnabled,
    ],
  );
  return { ...settings, codEnabled: false };
}

export async function GET(req: NextRequest) {
  const who = await requireAdmin(req, 'OWNER');
  if (who instanceof NextResponse) return who;

  try {
    return NextResponse.json(await getSettings());
  } catch (err) {
    return dbError(err, 'Failed to load store settings.');
  }
}

export async function PATCH(req: NextRequest) {
  const who = await requireAdmin(req, 'OWNER');
  if (who instanceof NextResponse) return who;

  const input = await req.json().catch(() => null);
  const flatShippingFee = Number(input?.flatShippingFee);
  const taxPercent = Number(input?.taxPercent);
  const freeShippingThreshold =
    input?.freeShippingThreshold === null || input?.freeShippingThreshold === ''
      ? null
      : Number(input?.freeShippingThreshold);

  if (
    !Number.isFinite(flatShippingFee) || flatShippingFee < 0 ||
    !Number.isFinite(taxPercent) || taxPercent < 0 ||
    (freeShippingThreshold !== null && (!Number.isFinite(freeShippingThreshold) || freeShippingThreshold < 0)) ||
    typeof input?.razorpayEnabled !== 'boolean'
  ) {
    return NextResponse.json({ message: 'Settings values must be valid non-negative numbers.' }, { status: 400 });
  }

  try {
    const [settings] = await query(
      `INSERT INTO "StoreSettings" (id, "flatShippingFee", "freeShippingThreshold", "taxPercent", "razorpayEnabled", "codEnabled", "updatedAt")
       VALUES ('singleton', $1, $2, $3, $4, $5, NOW())
       ON CONFLICT (id) DO UPDATE SET
         "flatShippingFee" = EXCLUDED."flatShippingFee",
         "freeShippingThreshold" = EXCLUDED."freeShippingThreshold",
         "taxPercent" = EXCLUDED."taxPercent",
         "razorpayEnabled" = EXCLUDED."razorpayEnabled",
         "codEnabled" = EXCLUDED."codEnabled",
         "updatedAt" = NOW()
       RETURNING *`,
      [flatShippingFee, freeShippingThreshold, taxPercent, input.razorpayEnabled, false],
    );
    return NextResponse.json(settings);
  } catch (err) {
    return dbError(err, 'Failed to update store settings.');
  }
}
