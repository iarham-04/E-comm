import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitContactApiDto } from '../common/dto/api-contract.dto';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async submit({ name, email, subject, message }: SubmitContactApiDto) {
    await this.prisma.contactSubmission.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        message: subject ? `[${subject.trim()}] ${message.trim()}` : message.trim(),
      },
    });
    return { success: true };
  }
}
