import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async submit(data: { name: string; email: string; message: string }) {
    if (!data.name || !data.email || !data.message) {
      throw new BadRequestException('Name, email, and message are required fields.');
    }

    return this.prisma.contactSubmission.create({
      data: {
        name: data.name,
        email: data.email,
        message: data.message,
      },
    });
  }
}
