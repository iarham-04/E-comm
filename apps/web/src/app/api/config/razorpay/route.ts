import { NextResponse } from 'next/server';

/** Exposes the public Razorpay key ID to the client checkout flow. */
export async function GET() {
  return NextResponse.json({
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '',
  });
}
