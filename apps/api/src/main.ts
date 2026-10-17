import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { clerkMiddleware } from '@clerk/express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

// Production domain, its subdomains, and this project's Vercel production/preview deployments only.
const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/([a-z0-9-]+\.)*corazontouch\.com$/,
  /^https:\/\/corazontouch(-[a-z0-9-]+)?\.vercel\.app$/,
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT') || 4000;
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  const allowedOrigins = new Set([frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000']);

  // Render and similar hosts sit behind one proxy hop; needed for per-client rate limiting.
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  app.use(helmet());

  app.enableCors({
    origin: (origin, callback) => {
      // No Origin header: server-to-server calls, webhooks, curl
      if (!origin || allowedOrigins.has(origin) || ALLOWED_ORIGIN_PATTERNS.some((re) => re.test(origin))) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: Origin '${origin}' not allowed.`), false);
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,Accept,X-Requested-With',
  });

  app.use(clerkMiddleware());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(port);
  new Logger('Bootstrap').log(`NestJS E-Commerce Backend API is running on port ${port}`);
}
bootstrap();
