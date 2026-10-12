import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { clerkMiddleware } from '@clerk/express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT') || 4000;
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

  // ── Security Headers (helmet) ──────────────────────────────────────────────
  app.use(helmet());

  // ── CORS — strict origin allowlist ─────────────────────────────────────────
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const allowedDomains = [
        frontendUrl,
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://corazontouch.com',
        'https://www.corazontouch.com',
      ];

      if (
        allowedDomains.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.corazontouch.com')
      ) {
        return callback(null, true);
      }

      // Reject unknown origins
      return callback(new Error(`CORS: Origin '${origin}' not allowed.`), false);
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,Accept,X-Requested-With',
  });

  // Attach Clerk middleware for JWT decoding
  app.use(clerkMiddleware());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global exception filter for clean JSON errors
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(port);
  console.log(`🚀 NestJS E-Commerce Backend API is running on: http://localhost:${port}`);
}
bootstrap();
