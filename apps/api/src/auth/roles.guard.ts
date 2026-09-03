import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.OWNER]: 4,
  [UserRole.MANAGER]: 3,
  [UserRole.SUPPORT]: 2,
  [UserRole.CUSTOMER]: 1,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no explicit role is required, default to true
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.dbUser;

    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }

    const userLevel = ROLE_HIERARCHY[user.role as UserRole] || 1;

    // Check if user level is >= minimum required role level
    const minRequiredLevel = Math.min(
      ...requiredRoles.map((r) => ROLE_HIERARCHY[r] || 99),
    );

    if (userLevel < minRequiredLevel) {
      throw new ForbiddenException(
        `Forbidden — Access requires minimum '${requiredRoles.join('/')}' role privileges.`,
      );
    }

    return true;
  }
}
