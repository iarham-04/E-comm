import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const emailArg = process.argv[2]?.trim();

  if (!emailArg || !emailArg.includes('@')) {
    console.error('Error: A valid email address must be provided as the first argument.');
    console.error('Usage: ts-node scripts/make-owner.ts <email>');
    console.error('Example: ts-node scripts/make-owner.ts owner@example.com');
    process.exit(1);
  }

  const email = emailArg.toLowerCase();
  console.log(`Searching for user with email: ${email}...`);

  const existingUser = await prisma.user.findFirst({
    where: {
      email: { equals: email, mode: 'insensitive' },
    },
  });

  if (existingUser) {
    const updated = await prisma.user.update({
      where: { id: existingUser.id },
      data: { role: UserRole.OWNER },
      select: { id: true, clerkId: true, email: true, name: true, role: true },
    });
    console.log(`Success: Updated existing user to OWNER:`);
    console.table([updated]);
  } else {
    console.log(`User not found. Creating pre-provisioned OWNER record for ${email}...`);
    const created = await prisma.user.create({
      data: {
        clerkId: `pre_provisioned_${Date.now()}`,
        email,
        name: email.split('@')[0],
        role: UserRole.OWNER,
      },
      select: { id: true, clerkId: true, email: true, name: true, role: true },
    });
    console.log(`Success: Pre-provisioned user as OWNER.`);
    console.table([created]);
  }
}

main()
  .catch((e) => {
    console.error('Failed to set user as OWNER:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
