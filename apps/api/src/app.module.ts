import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
})
export class AppModule {}
