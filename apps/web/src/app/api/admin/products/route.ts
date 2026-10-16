import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: true, variants: true },
    });

    return NextResponse.json(products);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name,
      slug,
      description,
      price,
      categoryId,
      images,
      stock,
      isActive,
      status,
      material,
      craftsmanshipStory,
      heightCm,
      widthCm,
      depthCm,
      weightKg,
      isLimitedEdition,
      editionNumber,
      editionTotal,
      isGiftEligible,
      metaTitle,
      metaDescription,
    } = body;

    if (!name || !slug || !description || price === undefined || !categoryId) {
      return NextResponse.json(
        { message: 'Missing required fields: name, slug, description, price, and categoryId are required.' },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await prisma.product.findUnique({
      where: { slug },
    });
    if (existing) {
      return NextResponse.json(
        { message: `A product with slug '${slug}' already exists. Please choose a different slug.` },
        { status: 409 }
      );
    }

    const created = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: Number(price),
        categoryId,
        images: Array.isArray(images) ? images : [],
        stock: stock !== undefined ? Number(stock) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        status: status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
        material: material || null,
        craftsmanshipStory: craftsmanshipStory || null,
        heightCm: heightCm ? Number(heightCm) : null,
        widthCm: widthCm ? Number(widthCm) : null,
        depthCm: depthCm ? Number(depthCm) : null,
        weightKg: weightKg ? Number(weightKg) : null,
        isLimitedEdition: Boolean(isLimitedEdition),
        editionNumber: editionNumber ? Number(editionNumber) : null,
        editionTotal: editionTotal ? Number(editionTotal) : null,
        isGiftEligible: isGiftEligible !== undefined ? Boolean(isGiftEligible) : true,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error('Error creating product:', err);
    return NextResponse.json(
      { message: err.message || 'Internal server error while creating product.' },
      { status: 500 }
    );
  }
}
