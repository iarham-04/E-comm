import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as crypto from 'crypto';

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

    const isProduction =
      process.env.NODE_ENV === 'production' ||
      this.configService.get('NODE_ENV') === 'production';

    if (!this.s3Client) {
      if (isProduction) {
        throw new InternalServerErrorException(
          'AWS S3 storage configuration is missing in production. Upload failed.',
        );
      }
      // Non-production local fallback
      const fileExt = file.originalname ? file.originalname.split('.').pop() : 'jpg';
      const randomHex = crypto.randomBytes(4).toString('hex');
      const key = `uploads/${Date.now()}-${randomHex}.${fileExt}`;
      const domain = this.cdnDomain || 'https://d1234.cloudfront.net';
      return { url: `${domain.replace(/\/$/, '')}/${key}`, key };
    }

    const fileExt = file.originalname ? file.originalname.split('.').pop() : 'jpg';
    const randomHex = crypto.randomBytes(4).toString('hex');
    const key = `uploads/${Date.now()}-${randomHex}.${fileExt}`;

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
