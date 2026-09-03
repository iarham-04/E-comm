import { Injectable, BadRequestException, Logger } from '@nestjs/common';
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
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET') || 'my-bucket';
    this.cdnDomain = this.configService.get<string>('CLOUDFRONT_DOMAIN') || 'https://d1234.cloudfront.net';

    if (accessKey && secretKey) {
      this.s3Client = new S3Client({
        region,
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        },
      });
      this.logger.log(`AWS S3 Upload Service initialized for bucket: ${this.bucket}`);
    } else {
      this.logger.warn('AWS credentials not configured. S3 upload endpoint will return mock CDN URLs.');
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<{ url: string; key: string }> {
    if (!file) {
      throw new BadRequestException('No file provided for upload.');
    }

    const fileExt = file.originalname ? file.originalname.split('.').pop() : 'jpg';
    const randomHex = crypto.randomBytes(4).toString('hex');
    const key = `uploads/${Date.now()}-${randomHex}.${fileExt}`;

    if (this.s3Client) {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);
      const url = `${this.cdnDomain.replace(/\/$/, '')}/${key}`;
      return { url, key };
    }

    // Mock fallback URL for development prior to AWS credential configuration
    const fallbackUrl = `${this.cdnDomain.replace(/\/$/, '')}/${key}`;
    return { url: fallbackUrl, key };
  }
}
