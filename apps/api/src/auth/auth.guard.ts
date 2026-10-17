import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { requireClerkId, resolveDbUser } from './clerk-user';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const clerkId = requireClerkId(request);

    const user = await resolveDbUser(this.prisma, clerkId, { create: true }).catch(() => null);
    if (!user) throw new UnauthorizedException('Authentication verification failed.');

    request.dbUser = user;
    return true;
  }
}
