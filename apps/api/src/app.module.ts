import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { UploadsModule } from './uploads/uploads.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { ContactModule } from './contact/contact.module';
import { AdminModule } from './admin/admin.module';
import { HomepageModule } from './homepage/homepage.module';
import { SearchModule } from './search/elasticsearch.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Global rate limiting: max 100 requests per 60 seconds per IP
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    PrismaModule,
    SearchModule,
    MailModule,
    RedisModule,
    UploadsModule,
    ProductsModule,
    OrdersModule,
    ContactModule,
    AdminModule,
    HomepageModule,
  ],
  controllers: [AppController],
  providers: [
    // Apply rate limiting globally to all routes
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
