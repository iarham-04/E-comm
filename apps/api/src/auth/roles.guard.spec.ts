import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { RolesGuard } from './roles.guard';
import * as clerkExpress from '@clerk/express';

jest.mock('@clerk/express', () => ({
  getAuth: jest.fn(),
  clerkClient: {
    users: {
      getUser: jest.fn(),
    },
  },
}));

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;
  let prisma: any;

  beforeEach(() => {
    reflector = new Reflector();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    prisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };
    guard = new RolesGuard(reflector, prisma);
    jest.clearAllMocks();
  });

  const createMockContext = (headers: Record<string, string> = {}): ExecutionContext => {
    const request = {
      headers,
    };
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  it('rejects when an adm_ token is provided', async () => {
    const context = createMockContext({
      authorization: 'Bearer adm_dGVzdDoxMjM=',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects when no token / no Clerk session is present', async () => {
    const context = createMockContext({});
    (clerkExpress.getAuth as jest.Mock).mockReturnValue({ userId: null });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects with 403 Forbidden when user is not found in database', async () => {
    const context = createMockContext({ authorization: 'Bearer valid_clerk_jwt' });
    (clerkExpress.getAuth as jest.Mock).mockReturnValue({ userId: 'user_clerk_123' });
    prisma.user.findUnique.mockResolvedValue(null);
    (clerkExpress.clerkClient.users.getUser as jest.Mock).mockRejectedValue(new Error('User not found'));

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('rejects with 403 Forbidden when user role is CUSTOMER', async () => {
    const context = createMockContext({ authorization: 'Bearer valid_clerk_jwt' });
    (clerkExpress.getAuth as jest.Mock).mockReturnValue({ userId: 'user_clerk_cust' });
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      clerkId: 'user_clerk_cust',
      role: UserRole.CUSTOMER,
      email: 'customer@example.com',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  describe('staff role hierarchy enforcement', () => {
    it('accepts SUPPORT, MANAGER, and OWNER when minimum role is SUPPORT', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.SUPPORT]);

      for (const role of [UserRole.SUPPORT, UserRole.MANAGER, UserRole.OWNER]) {
        const context = createMockContext({ authorization: 'Bearer valid_clerk_jwt' });
        (clerkExpress.getAuth as jest.Mock).mockReturnValue({ userId: `user_${role}` });
        prisma.user.findUnique.mockResolvedValue({
          id: `u_${role}`,
          clerkId: `user_${role}`,
          role,
        });

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
      }
    });

    it('rejects SUPPORT when minimum role is MANAGER', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.MANAGER]);

      const context = createMockContext({ authorization: 'Bearer valid_clerk_jwt' });
      (clerkExpress.getAuth as jest.Mock).mockReturnValue({ userId: 'user_support' });
      prisma.user.findUnique.mockResolvedValue({
        id: 'u_support',
        clerkId: 'user_support',
        role: UserRole.SUPPORT,
      });

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('accepts MANAGER and OWNER when minimum role is MANAGER', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.MANAGER]);

      for (const role of [UserRole.MANAGER, UserRole.OWNER]) {
        const context = createMockContext({ authorization: 'Bearer valid_clerk_jwt' });
        (clerkExpress.getAuth as jest.Mock).mockReturnValue({ userId: `user_${role}` });
        prisma.user.findUnique.mockResolvedValue({
          id: `u_${role}`,
          clerkId: `user_${role}`,
          role,
        });

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
      }
    });

    it('rejects MANAGER when minimum role is OWNER', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.OWNER]);

      const context = createMockContext({ authorization: 'Bearer valid_clerk_jwt' });
      (clerkExpress.getAuth as jest.Mock).mockReturnValue({ userId: 'user_manager' });
      prisma.user.findUnique.mockResolvedValue({
        id: 'u_manager',
        clerkId: 'user_manager',
        role: UserRole.MANAGER,
      });

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('accepts OWNER when minimum role is OWNER', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.OWNER]);

      const context = createMockContext({ authorization: 'Bearer valid_clerk_jwt' });
      (clerkExpress.getAuth as jest.Mock).mockReturnValue({ userId: 'user_owner' });
      prisma.user.findUnique.mockResolvedValue({
        id: 'u_owner',
        clerkId: 'user_owner',
        role: UserRole.OWNER,
      });

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });
  });
});
