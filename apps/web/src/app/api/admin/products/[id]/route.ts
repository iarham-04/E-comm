import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { category: true, variants: true },
    });

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.price !== undefined && { price: Number(body.price) }),
        ...(body.categoryId !== undefined && { categoryId: body.categoryId }),
        ...(body.images !== undefined && { images: body.images }),
        ...(body.stock !== undefined && { stock: Number(body.stock) }),
        ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.material !== undefined && { material: body.material }),
        ...(body.craftsmanshipStory !== undefined && { craftsmanshipStory: body.craftsmanshipStory }),
        ...(body.heightCm !== undefined && { heightCm: body.heightCm ? Number(body.heightCm) : null }),
        ...(body.widthCm !== undefined && { widthCm: body.widthCm ? Number(body.widthCm) : null }),
        ...(body.depthCm !== undefined && { depthCm: body.depthCm ? Number(body.depthCm) : null }),
        ...(body.weightKg !== undefined && { weightKg: body.weightKg ? Number(body.weightKg) : null }),
        ...(body.isLimitedEdition !== undefined && { isLimitedEdition: Boolean(body.isLimitedEdition) }),
        ...(body.editionNumber !== undefined && { editionNumber: body.editionNumber ? Number(body.editionNumber) : null }),
        ...(body.editionTotal !== undefined && { editionTotal: body.editionTotal ? Number(body.editionTotal) : null }),
        ...(body.isGiftEligible !== undefined && { isGiftEligible: Boolean(body.isGiftEligible) }),
        ...(body.metaTitle !== undefined && { metaTitle: body.metaTitle }),
        ...(body.metaDescription !== undefined && { metaDescription: body.metaDescription }),
      },
      include: { category: true },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to delete product' }, { status: 500 });
  }
}
