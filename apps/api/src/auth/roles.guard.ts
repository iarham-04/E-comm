import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { getAuth, clerkClient } from '@clerk/express';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ROLES_KEY } from './roles.decorator';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.OWNER]: 4,
  [UserRole.MANAGER]: 3,
  [UserRole.SUPPORT]: 2,
  [UserRole.CUSTOMER]: 1,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();

    // Reject any attempt to use deprecated adm_ tokens
    const authHeader = request.headers?.['authorization'] || request.headers?.['x-admin-token'];
    if (authHeader) {
      const token = typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';
      if (token.startsWith('adm_')) {
        throw new UnauthorizedException('Unauthorized — adm_ tokens are deprecated.');
      }
    }

    // 1. Authenticate caller via Clerk session token verification
    let clerkId: string | null = null;
    try {
      const auth = getAuth(request);
      clerkId = auth?.userId || null;
    } catch {
      throw new UnauthorizedException('Authentication verification failed.');
    }

    if (!clerkId) {
      throw new UnauthorizedException('Unauthorized — valid Clerk session required.');
    }

    // 2. Fetch User from database at request time
    let user = await this.prisma.user.findUnique({
      where: { clerkId },
    });

    // If user was pre-provisioned by email, link their clerkId using Clerk API
    if (!user) {
      try {
        const clerkUser = await clerkClient.users.getUser(clerkId);
        const primaryEmail = clerkUser?.emailAddresses?.find(
          (e) => e.id === clerkUser.primaryEmailAddressId,
        );
        if (primaryEmail) {
          const emailMatch = await this.prisma.user.findFirst({
            where: { email: { equals: primaryEmail.emailAddress, mode: 'insensitive' } },
          });
          if (emailMatch) {
            user = await this.prisma.user.update({
              where: { id: emailMatch.id },
              data: { clerkId },
            });
          }
        }
      } catch {
        // Clerk API call failed or user does not exist
      }
    }

    // A CUSTOMER or a user with no row gets 403 on every /admin/* route
    if (!user) {
      throw new ForbiddenException('Forbidden — User record not found.');
    }

    if (user.role === UserRole.CUSTOMER) {
      throw new ForbiddenException('Forbidden — Staff privileges required.');
    }

    request.dbUser = user;

    const userLevel = ROLE_HIERARCHY[user.role as UserRole] || 1;

    // 3. Minimum role hierarchy verification
    if (requiredRoles && requiredRoles.length > 0) {
      const minRequiredLevel = Math.min(
        ...requiredRoles.map((r) => ROLE_HIERARCHY[r] || 99),
      );

      if (userLevel < minRequiredLevel) {
        throw new ForbiddenException(
          `Forbidden — Access requires minimum '${requiredRoles.join('/')}' role privileges.`,
        );
      }
    } else {
      // Default: require at least SUPPORT
      if (userLevel < ROLE_HIERARCHY[UserRole.SUPPORT]) {
        throw new ForbiddenException('Forbidden — Staff privileges required.');
      }
    }

    return true;
  }
}
