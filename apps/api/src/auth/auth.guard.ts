import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getAuth } from '@clerk/express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      const { userId: clerkId } = getAuth(request);

      if (!clerkId) {
        throw new UnauthorizedException('Unauthorized — valid Clerk token required.');
      }

      // Sync user to database on first sighting
      let user = await this.prisma.user.findUnique({
        where: { clerkId },
      });

      if (!user) {
        // Attempt to fetch email/name from request headers or default
        const email = request.headers['x-user-email'] || `${clerkId}@clerk.user`;
        const name = request.headers['x-user-name'] || null;

        user = await this.prisma.user.create({
          data: {
            clerkId,
            email,
            name,
          },
        });
      }

      request.dbUser = user;
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Authentication verification failed.');
    }
  }
}
