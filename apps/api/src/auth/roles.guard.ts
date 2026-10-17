import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ROLES_KEY } from './roles.decorator';
import { requireClerkId, resolveDbUser } from './clerk-user';
import { verifyPinSession, masterPinUser } from './pin-session';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.OWNER]: 4,
  [UserRole.MANAGER]: 3,
  [UserRole.SUPPORT]: 2,
  [UserRole.CUSTOMER]: 1,
};

export const isStaff = (role?: UserRole | null) =>
  !!role && ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[UserRole.SUPPORT];

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
    const pin = verifyPinSession(request.headers?.['x-admin-token']);

    const user = pin ? masterPinUser(pin.name) : await resolveDbUser(this.prisma, requireClerkId(request));
    if (!user) throw new ForbiddenException('Forbidden — User record not found.');
    if (!isStaff(user.role)) throw new ForbiddenException('Forbidden — Staff privileges required.');

    // Default minimum is SUPPORT (already enforced above)
    if (requiredRoles?.length) {
      const minLevel = Math.min(...requiredRoles.map((r) => ROLE_HIERARCHY[r] ?? 99));
      if (ROLE_HIERARCHY[user.role] < minLevel) {
        throw new ForbiddenException(
          `Forbidden — Access requires minimum '${requiredRoles.join('/')}' role privileges.`,
        );
      }
    }

    request.dbUser = user;
    return true;
  }
}
