import { Controller, Post, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ContactService } from './contact.service';
import { SubmitContactApiDto } from '../common/dto/api-contract.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  submit(@Body() body: SubmitContactApiDto) {
    return this.contactService.submit(body);
  }
}
