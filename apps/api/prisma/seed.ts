import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database taxonomy & categories...');

  const categories = [
    { name: 'Almonds', slug: 'almonds' },
    { name: 'Cashews', slug: 'cashews' },
    { name: 'Pistachios', slug: 'pistachios' },
    { name: 'Walnuts', slug: 'walnuts' },
    { name: 'Raisins', slug: 'raisins' },
    { name: 'Dates', slug: 'dates' },
    { name: 'Mixed Dry Fruits', slug: 'mixed-dry-fruits' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    });
  }

  console.log('✅ Categories seeded successfully.');

  // Seed CMS pages
  await prisma.cmsPage.upsert({
    where: { slug: 'about' },
    update: {},
    create: {
      slug: 'about',
      title: 'About Us',
      content: '# About Our Storefront\n\nWe craft and curate authentic medieval, viking, and ancient historical collectibles, home decor, and handcrafted furniture built for modern spaces.',
      isPublished: true,
    },
  });

  await prisma.cmsPage.upsert({
    where: { slug: 'contact-us' },
    update: {},
    create: {
      slug: 'contact-us',
      title: 'Contact Us',
      content: '# Contact Customer Support\n\nHave a question about an order or product customization? Reach out to our team at support@example.com.',
      isPublished: true,
    },
  });

  console.log('✅ CMS Pages seeded successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
