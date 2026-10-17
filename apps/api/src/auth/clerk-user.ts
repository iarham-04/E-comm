import { UnauthorizedException } from '@nestjs/common';
import { getAuth, clerkClient } from '@clerk/express';
import { User, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/** Placeholder clerkId prefix written by prisma/assign-owner.ts for users who have not signed in yet. */
export const PRE_PROVISIONED_PREFIX = 'pre_provisioned_';

/** Returns the Clerk user id of the caller, or null for anonymous requests. Never throws. */
export function getClerkId(req: any): string | null {
  try {
    return getAuth(req)?.userId || null;
  } catch {
    return null;
  }
}

/** Rejects legacy `adm_` tokens, then returns the Clerk user id or throws 401. */
export function requireClerkId(req: any): string {
  const header = req.headers?.authorization || req.headers?.['x-admin-token'];
  if (typeof header === 'string' && header.replace(/^Bearer\s+/i, '').trim().startsWith('adm_')) {
    throw new UnauthorizedException('Unauthorized — adm_ tokens are deprecated.');
  }
  const clerkId = getClerkId(req);
  if (!clerkId) throw new UnauthorizedException('Unauthorized — valid Clerk session required.');
  return clerkId;
}

/**
 * Loads the DB user for a Clerk id. If none exists, a pre-provisioned row is claimed only when
 * the Clerk primary email is verified and the row has never been linked to a real Clerk account.
 * With `create`, an unknown user gets a fresh CUSTOMER row.
 */
export async function resolveDbUser(
  prisma: PrismaService,
  clerkId: string,
  { create = false } = {},
): Promise<User | null> {
  const existing = await prisma.user.findUnique({ where: { clerkId } });
  if (existing) return existing;

  let email: string | null = null;
  let name: string | null = null;
  try {
    const clerkUser = await clerkClient.users.getUser(clerkId);
    const primary = clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId);
    if (primary?.verification?.status === 'verified') email = primary.emailAddress.toLowerCase();
    name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null;
  } catch {
    // Clerk API unavailable — fall through without email linking
  }

  if (email) {
    const byEmail = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
    if (byEmail?.clerkId.startsWith(PRE_PROVISIONED_PREFIX)) {
      return prisma.user.update({
        where: { id: byEmail.id },
        data: { clerkId, ...(name && !byEmail.name ? { name } : {}) },
      });
    }
    // Email already belongs to another Clerk account: never inherit that row (or its role)
    if (byEmail) email = null;
  }

  if (!create) return null;
  return prisma.user.create({
    data: { clerkId, email: email ?? `${clerkId}@clerk.user`, name, role: UserRole.CUSTOMER },
  });
}
