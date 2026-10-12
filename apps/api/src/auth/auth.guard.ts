import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getAuth, clerkClient } from '@clerk/express';
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
        // SECURITY FIX: Fetch user info from Clerk API server-side,
        // NOT from client-supplied headers (prevents account takeover via header spoofing)
        let email = `${clerkId}@clerk.user`;
        let name: string | null = null;

        try {
          const clerkUser = await clerkClient.users.getUser(clerkId);
          const primaryEmail = clerkUser.emailAddresses.find(
            (e) => e.id === clerkUser.primaryEmailAddressId,
          );
          if (primaryEmail) {
            email = primaryEmail.emailAddress;
          }
          name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null;
        } catch (clerkErr) {
          // If Clerk API fails, fallback to minimal user creation
          console.warn(`Could not fetch Clerk user details for ${clerkId}:`, clerkErr);
        }

        // Check if pre-provisioned by email
        const existingByEmail = await this.prisma.user.findFirst({
          where: { email: { equals: email, mode: 'insensitive' } },
        });

        if (existingByEmail) {
          user = await this.prisma.user.update({
            where: { id: existingByEmail.id },
            data: { clerkId, ...(name ? { name } : {}) },
          });
        } else {
          user = await this.prisma.user.create({
            data: {
              clerkId,
              email,
              name,
            },
          });
        }
      }

      request.dbUser = user;
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Authentication verification failed.');
    }
  }
}
