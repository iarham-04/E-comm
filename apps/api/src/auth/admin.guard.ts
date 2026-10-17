import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { isStaff } from './roles.guard';

/** Must run after AuthGuard, which populates request.dbUser. */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest().dbUser;
    if (!user) throw new UnauthorizedException('Authentication required.');
    if (!isStaff(user.role)) throw new ForbiddenException('Forbidden — Admin access required.');
    return true;
  }
}
