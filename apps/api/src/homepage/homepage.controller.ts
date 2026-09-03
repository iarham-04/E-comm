import { Controller, Get, Post, Body } from '@nestjs/common';
import { HomepageService } from './homepage.service';

@Controller()
export class HomepageController {
  constructor(private readonly homepageService: HomepageService) {}

  @Get('homepage')
  getHomepageData() {
    return this.homepageService.getHomepageData();
  }

  @Post('newsletter/subscribe')
  subscribeNewsletter(@Body('email') email: string) {
    return this.homepageService.subscribeNewsletter(email);
  }
}
