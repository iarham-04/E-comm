import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getAuth, clerkClient } from '@clerk/express';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 0. Support Master Admin PIN session tokens (adm_...)
    const authHeader = request.headers['authorization'] || request.headers['x-admin-token'];
    if (authHeader) {
      const token = typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';
      if (token.startsWith('adm_')) {
        try {
          const raw = Buffer.from(token.replace('adm_', ''), 'base64').toString('utf8');
          const [name] = raw.split(':');
          request.dbUser = {
            id: 'admin-master',
            clerkId: 'admin-master',
            role: UserRole.OWNER,
            email: 'azra@corazontouch.com',
            name: name || 'AZRA',
          };
          return true;
        } catch {
          // Fall through
        }
      }
    }

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
              role: UserRole.CUSTOMER,
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
