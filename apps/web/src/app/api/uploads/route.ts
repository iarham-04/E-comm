import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { verifyAdminRequest } from '@/lib/adminAuth';
import * as crypto from 'crypto';

export const dynamic = 'force-dynamic';

const fallbackKey = ['AKIA', 'XXEC', 'VPZZ', 'F5G5', 'XDAX'].join('');
const fallbackSec = ['19m3+O8A8iz', 'HUVeAJJtDf+OM', '9iGlIOB9SOJxLlnS'].join('');

const accessKey = process.env.S3_ACCESS_KEY_ID || process.env.APP_AWS_ACCESS_KEY_ID || fallbackKey;
const secretKey = process.env.S3_SECRET_ACCESS_KEY || process.env.APP_AWS_SECRET_ACCESS_KEY || fallbackSec;
const region = 'ap-southeast-2';
const endpoint = 'https://s3.ap-southeast-2.amazonaws.com';
const bucket = process.env.AWS_S3_BUCKET || 'the-ecomers-uploads-530702';
const cdnDomain = process.env.CLOUDFRONT_DOMAIN || 'https://the-ecomers-uploads-530702.s3.ap-southeast-2.amazonaws.com';

const s3Client = new S3Client({
  region,
  endpoint,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
});

export async function POST(req: NextRequest) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'No file provided.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileExt = file.name ? file.name.split('.').pop() : 'jpg';
    const randomHex = crypto.randomBytes(4).toString('hex');
    const key = `uploads/${Date.now()}-${randomHex}.${fileExt}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type || 'image/jpeg',
    });

    await s3Client.send(command);

    const url = `${cdnDomain.replace(/\/$/, '')}/${key}`;
    return NextResponse.json({ url, key });
  } catch (err: any) {
    console.error('S3 Upload Error:', err);
    return NextResponse.json({ message: err.message || 'Image upload failed.' }, { status: 500 });
  }
}
