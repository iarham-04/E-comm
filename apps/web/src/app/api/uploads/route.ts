import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as crypto from 'crypto';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 10 * 1024 * 1024;

/** Extension per allowed type, plus a magic-byte check so the declared type cannot be spoofed. */
const IMAGE_TYPES: Record<string, { ext: string; matches: (b: Buffer) => boolean }> = {
  'image/jpeg': { ext: 'jpg', matches: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  'image/png': { ext: 'png', matches: (b) => b.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47])) },
  'image/webp': { ext: 'webp', matches: (b) => b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP' },
  'image/avif': { ext: 'avif', matches: (b) => b.toString('ascii', 4, 8) === 'ftyp' },
};

// Credentials come only from the environment — never commit keys.
const accessKeyId = process.env.S3_ACCESS_KEY_ID || process.env.APP_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey =
  process.env.S3_SECRET_ACCESS_KEY || process.env.APP_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION || 'ap-southeast-2';
const bucket = process.env.AWS_S3_BUCKET;
const cdnDomain = (process.env.CLOUDFRONT_DOMAIN || `https://${bucket}.s3.${region}.amazonaws.com`).replace(/\/$/, '');

const s3 =
  accessKeyId && secretAccessKey && bucket
    ? new S3Client({ region, credentials: { accessKeyId, secretAccessKey } })
    : null;

export async function POST(req: NextRequest) {
  const who = await requireAdmin(req, 'MANAGER');
  if (who instanceof NextResponse) return who;
  if (!s3) return NextResponse.json({ message: 'Image storage is not configured.' }, { status: 503 });

  try {
    const file = (await req.formData()).get('file');
    if (!(file instanceof File)) return NextResponse.json({ message: 'No file provided.' }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ message: 'File is larger than 10 MB.' }, { status: 413 });

    const type = IMAGE_TYPES[file.type];
    const buffer = Buffer.from(await file.arrayBuffer());
    if (!type || buffer.length < 12 || !type.matches(buffer)) {
      return NextResponse.json({ message: 'Only JPEG, PNG, WebP or AVIF images are allowed.' }, { status: 400 });
    }

    const key = `uploads/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${type.ext}`;
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: file.type }));
    return NextResponse.json({ url: `${cdnDomain}/${key}`, key });
  } catch (err) {
    console.error('S3 upload error:', err);
    return NextResponse.json({ message: 'Image upload failed.' }, { status: 500 });
  }
}
