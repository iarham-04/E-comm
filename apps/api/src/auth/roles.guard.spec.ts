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

describe('resolveDbUser account linking', () => {
  const { resolveDbUser } = jest.requireActual('./clerk-user');
  const clerkUser = (status: string) => ({
    primaryEmailAddressId: 'e1',
    emailAddresses: [{ id: 'e1', emailAddress: 'owner@shop.com', verification: { status } }],
    firstName: 'Shop',
    lastName: 'Owner',
  });
  let prisma: any;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        findFirst: jest.fn(),
        update: jest.fn(async ({ data }: any) => ({ id: 'owner_row', role: UserRole.OWNER, ...data })),
        create: jest.fn(async ({ data }: any) => ({ id: 'new_row', ...data })),
      },
    };
  });

  it('claims a pre-provisioned row when the Clerk email is verified', async () => {
    (clerkExpress.clerkClient.users.getUser as jest.Mock).mockResolvedValue(clerkUser('verified'));
    prisma.user.findFirst.mockResolvedValue({ id: 'owner_row', clerkId: 'pre_provisioned_1', name: null });
    const user = await resolveDbUser(prisma, 'user_new');
    expect(user.role).toBe(UserRole.OWNER);
    expect(prisma.user.update).toHaveBeenCalled();
  });

  it('never links on an unverified email', async () => {
    (clerkExpress.clerkClient.users.getUser as jest.Mock).mockResolvedValue(clerkUser('unverified'));
    const user = await resolveDbUser(prisma, 'user_attacker');
    expect(user).toBeNull();
    expect(prisma.user.findFirst).not.toHaveBeenCalled();
  });

  it('never takes over a row already linked to another Clerk account', async () => {
    (clerkExpress.clerkClient.users.getUser as jest.Mock).mockResolvedValue(clerkUser('verified'));
    prisma.user.findFirst.mockResolvedValue({ id: 'owner_row', clerkId: 'user_real_owner', role: UserRole.OWNER });
    const user = await resolveDbUser(prisma, 'user_attacker', { create: true });
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(user.role).toBe(UserRole.CUSTOMER);
    expect(user.email).toBe('user_attacker@clerk.user');
  });
});

describe('RolesGuard master-PIN sessions', () => {
  const crypto = jest.requireActual('crypto');
  const SECRET = 'test-secret-that-is-at-least-32-characters-long';
  const makeToken = (payload: object, secret = SECRET) => {
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `pin.${body}.${crypto.createHmac('sha256', secret).update(body).digest('base64url')}`;
  };
  const ctx = (headers: Record<string, string>) => {
    const request: any = { headers };
    return {
      request,
      context: {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({ getRequest: () => request }),
      } as unknown as ExecutionContext,
    };
  };
  let guard: RolesGuard;

  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = SECRET;
    const reflector = new Reflector();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.OWNER]);
    guard = new RolesGuard(reflector, { user: { findUnique: jest.fn().mockResolvedValue(null) } } as any);
    (clerkExpress.getAuth as jest.Mock).mockReturnValue({ userId: null });
  });

  afterAll(() => delete process.env.ADMIN_SESSION_SECRET);

  it('accepts a valid signed PIN token as OWNER', async () => {
    const { context, request } = ctx({
      'x-admin-token': makeToken({ name: 'Azra', role: 'OWNER', exp: Date.now() + 60000 }),
    });
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.dbUser.role).toBe(UserRole.OWNER);
  });

  it('rejects a token signed with the wrong secret', async () => {
    const forged = makeToken({ name: 'x', role: 'OWNER', exp: Date.now() + 60000 }, 'attacker-guess-attacker-guess-attacker');
    await expect(guard.canActivate(ctx({ 'x-admin-token': forged }).context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects an expired token', async () => {
    const expired = makeToken({ name: 'x', role: 'OWNER', exp: Date.now() - 1 });
    await expect(guard.canActivate(ctx({ 'x-admin-token': expired }).context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('ignores spoofed identity headers', async () => {
    await expect(
      guard.canActivate(ctx({ 'x-user-name': 'AZRA', 'x-user-email': 'owner@corazontouch.com' }).context),
    ).rejects.toThrow(UnauthorizedException);
  });
});
