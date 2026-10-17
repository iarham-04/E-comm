import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as crypto from 'crypto';

export const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

/** The browser-supplied MIME type is not trusted; check the file's magic bytes too. */
function matchesSignature(buf: Buffer | undefined, ext: string): boolean {
  if (!buf || buf.length < 12) return false;
  switch (ext) {
    case 'jpg': return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    case 'png': return buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    case 'webp': return buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP';
    case 'avif': return buf.toString('ascii', 4, 8) === 'ftyp';
    default: return false;
  }
}

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private s3Client: S3Client | null = null;
  private bucket: string;
  private cdnDomain: string;

  constructor(private configService: ConfigService) {
    const accessKey = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    const region = this.configService.get<string>('AWS_REGION') || 'us-east-1';
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET') || '';
    this.cdnDomain = this.configService.get<string>('CLOUDFRONT_DOMAIN') || '';

    if (accessKey && secretKey && this.bucket) {
      this.s3Client = new S3Client({
        region,
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        },
      });
      this.logger.log(`AWS S3 Upload Service initialized for bucket: ${this.bucket}`);
    } else {
      this.logger.warn('AWS S3 credentials or bucket not configured.');
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<{ url: string; key: string }> {
    if (!file) {
      throw new BadRequestException('No file provided for upload.');
    }

    const ext = MIME_EXTENSIONS[file.mimetype];
    if (!ext || !matchesSignature(file.buffer, ext)) {
      throw new BadRequestException('File content is not a valid JPEG, PNG, WebP or AVIF image.');
    }
    const key = `uploads/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`;

    if (!this.s3Client) {
      if (process.env.NODE_ENV === 'production') {
        throw new InternalServerErrorException('AWS S3 storage configuration is missing in production. Upload failed.');
      }
      // Non-production placeholder: nothing is stored
      const domain = this.cdnDomain || 'https://d1234.cloudfront.net';
      return { url: `${domain.replace(/\/$/, '')}/${key}`, key };
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);
    const domain = this.cdnDomain || `https://${this.bucket}.s3.amazonaws.com`;
    const url = `${domain.replace(/\/$/, '')}/${key}`;
    return { url, key };
  }
}
