import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const RequireRole = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
