import { Controller, Get, Post, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { HomepageService } from './homepage.service';
import { SubscribeNewsletterApiDto } from '../common/dto/api-contract.dto';

@Controller()
export class HomepageController {
  constructor(private readonly homepageService: HomepageService) {}

  @Get('homepage')
  getHomepageData() {
    return this.homepageService.getHomepageData();
  }

  @Post('newsletter/subscribe')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  subscribeNewsletter(@Body() { email }: SubscribeNewsletterApiDto) {
    return this.homepageService.subscribeNewsletter(email);
  }
}
