import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const target = process.argv[2]?.trim();

  if (!target) {
    console.error('Usage: ts-node prisma/assign-owner.ts <email-or-clerkId> [optional-name]');
    console.log('\nCurrent registered users:');
    const allUsers = await prisma.user.findMany({
      select: { id: true, clerkId: true, email: true, name: true, role: true },
    });
    console.table(allUsers);
    process.exit(1);
  }

  const optionalName = process.argv[3]?.trim();

  console.log(`🔍 Looking for user matching '${target}'...`);

  // Try finding by email (case-insensitive) or clerkId
  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { equals: target, mode: 'insensitive' } },
        { clerkId: target },
      ],
    },
  });

  if (user) {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        role: UserRole.OWNER,
        ...(optionalName ? { name: optionalName } : {}),
      },
      select: { id: true, clerkId: true, email: true, name: true, role: true },
    });
    console.log(`✅ Successfully promoted user to OWNER:`);
    console.table([updated]);
  } else {
    // If user has not signed in yet, we can create their record with email
    console.log(`ℹ️ User '${target}' not found in DB. Creating pre-provisioned OWNER record...`);
    const isEmail = target.includes('@');
    const email = isEmail ? target.toLowerCase() : `${target}@clerk.user`;
    const clerkId = isEmail ? `pre_provisioned_${Date.now()}` : target;

    const created = await prisma.user.create({
      data: {
        clerkId,
        email,
        name: optionalName || (isEmail ? target.split('@')[0] : 'Owner'),
        role: UserRole.OWNER,
      },
      select: { id: true, clerkId: true, email: true, name: true, role: true },
    });
    console.log(`✅ Pre-provisioned OWNER user successfully:`);
    console.table([created]);
    console.log(`Note: If they sign in via Clerk with this email, their clerkId will sync on first sign-in.`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error assigning OWNER role:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
