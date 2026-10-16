import { NextRequest, NextResponse } from 'next/server';
import { query, generateId } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const products = await query(`
      SELECT p.*,
             json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) as category,
             COALESCE(
               (SELECT json_agg(v.*) FROM "ProductVariant" v WHERE v."productId" = p.id),
               '[]'::json
             ) as variants
      FROM "Product" p
      LEFT JOIN "Category" c ON p."categoryId" = c.id
      ORDER BY p."createdAt" DESC
    `);

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
    const existing = await query(`SELECT id FROM "Product" WHERE slug = $1`, [slug]);
    if (existing.length > 0) {
      return NextResponse.json(
        { message: `A product with slug '${slug}' already exists. Please choose a different slug.` },
        { status: 409 }
      );
    }

    const id = generateId();
    const imageArray = Array.isArray(images) ? images : [];
    const stockVal = stock !== undefined ? Number(stock) : 0;
    const activeVal = isActive !== undefined ? Boolean(isActive) : true;
    const statusVal = status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';

    const rows = await query(`
      INSERT INTO "Product" (
        id, name, slug, description, price, "categoryId", images, stock, "isActive", status,
        material, "craftsmanshipStory", "heightCm", "widthCm", "depthCm", "weightKg",
        "isLimitedEdition", "editionNumber", "editionTotal", "isGiftEligible",
        "metaTitle", "metaDescription", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20,
        $21, $22, NOW(), NOW()
      ) RETURNING *
    `, [
      id,
      name,
      slug,
      description,
      Number(price),
      categoryId,
      imageArray,
      stockVal,
      activeVal,
      statusVal,
      material || null,
      craftsmanshipStory || null,
      heightCm ? Number(heightCm) : null,
      widthCm ? Number(widthCm) : null,
      depthCm ? Number(depthCm) : null,
      weightKg ? Number(weightKg) : null,
      Boolean(isLimitedEdition),
      editionNumber ? Number(editionNumber) : null,
      editionTotal ? Number(editionTotal) : null,
      isGiftEligible !== undefined ? Boolean(isGiftEligible) : true,
      metaTitle || null,
      metaDescription || null,
    ]);

    return NextResponse.json(rows[0], { status: 201 });
  } catch (err: any) {
    console.error('Error creating product:', err);
    return NextResponse.json(
      { message: err.message || 'Internal server error while creating product.' },
      { status: 500 }
    );
  }
}
