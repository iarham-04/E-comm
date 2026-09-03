import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.dbUser;

    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }

    if (!user.role || user.role === UserRole.CUSTOMER) {
      throw new ForbiddenException('Forbidden — Admin access required.');
    }

    return true;
  }
}
