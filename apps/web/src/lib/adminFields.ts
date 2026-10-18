import 'server-only';

type Kind = 'text' | 'number' | 'int' | 'bool' | 'images' | 'status';

/** Editable Product columns and how each body value is validated. */
const PRODUCT_FIELDS: Record<string, Kind> = {
  name: 'text', slug: 'text', description: 'text', price: 'number', categoryId: 'text',
  images: 'images', stock: 'int', isActive: 'bool', status: 'status',
  metaTitle: 'text', metaDescription: 'text', craftsmanshipStory: 'text',
  isLimitedEdition: 'bool', editionNumber: 'int', editionTotal: 'int', isGiftEligible: 'bool',
};

export const REQUIRED_ON_CREATE = ['name', 'slug', 'description', 'price', 'categoryId'];
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function coerce(key: string, kind: Kind, v: any): any {
  if (v === null || v === '') {
    if (REQUIRED_ON_CREATE.includes(key) || kind === 'bool' || kind === 'images' || key === 'stock') {
      throw new Error(`${key} cannot be empty.`);
    }
    return null;
  }
  switch (kind) {
    case 'text': {
      const s = String(v).trim();
      if (key === 'slug' && !SLUG.test(s)) throw new Error('slug may contain only lowercase letters, numbers and dashes.');
      return s;
    }
    case 'number':
    case 'int': {
      const n = Number(v);
      if (!Number.isFinite(n) || n < 0 || (kind === 'int' && !Number.isInteger(n))) {
        throw new Error(`${key} must be a non-negative ${kind === 'int' ? 'whole number' : 'number'}.`);
      }
      if (key === 'price' && n <= 0) throw new Error('price must be greater than 0.');
      return n;
    }
    case 'bool':
      if (typeof v !== 'boolean') throw new Error(`${key} must be true or false.`);
      return v;
    case 'images':
      if (!Array.isArray(v) || v.some((u) => typeof u !== 'string' || !/^https:\/\//.test(u))) {
        throw new Error('images must be a list of https URLs.');
      }
      return v;
    case 'status':
      if (v !== 'DRAFT' && v !== 'PUBLISHED') throw new Error('status must be DRAFT or PUBLISHED.');
      return v;
  }
}

/** Validates a request body into `{ column: value }` for known Product fields only. Throws on bad input. */
export function parseProductBody(body: any, { create = false } = {}): Record<string, any> {
  if (!body || typeof body !== 'object') throw new Error('Invalid request body.');
  const out: Record<string, any> = {};
  for (const [key, kind] of Object.entries(PRODUCT_FIELDS)) {
    if (body[key] !== undefined) out[key] = coerce(key, kind, body[key]);
  }
  if (create) {
    const missing = REQUIRED_ON_CREATE.filter((k) => out[k] == null);
    if (missing.length) throw new Error(`Missing required fields: ${missing.join(', ')}.`);
  }
  const limited = out.isLimitedEdition;
  if (limited && (out.editionNumber == null || out.editionTotal == null)) {
    throw new Error('Limited edition products require both editionNumber and editionTotal.');
  }
  if (out.editionNumber != null && out.editionTotal != null && out.editionNumber > out.editionTotal) {
    throw new Error('editionNumber must be ≤ editionTotal.');
  }
  return out;
}

/** Quotes a camelCase column for Postgres. Keys come only from PRODUCT_FIELDS, never from the client. */
export const col = (key: string) => `"${key}"`;

export const PRODUCT_SELECT = `
  SELECT p.*,
         json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) AS category,
         COALESCE((SELECT json_agg(v.*) FROM "ProductVariant" v WHERE v."productId" = p.id), '[]'::json) AS variants
  FROM "Product" p
  LEFT JOIN "Category" c ON p."categoryId" = c.id`;

/** Validates category input; `partial` allows omitting fields on update. */
export function parseCategoryBody(body: any, partial = false) {
  const name = typeof body?.name === 'string' ? body.name.trim() : undefined;
  const slug = typeof body?.slug === 'string' ? body.slug.trim() : undefined;
  if (!partial && (!name || !slug)) throw new Error('Name and slug are required.');
  if (name !== undefined && (!name || name.length > 100)) throw new Error('Name must be 1–100 characters.');
  if (slug !== undefined && !SLUG.test(slug)) throw new Error('Slug may contain only lowercase letters, numbers and dashes.');
  if (body?.isFeaturedCollection !== undefined && typeof body.isFeaturedCollection !== 'boolean') {
    throw new Error('isFeaturedCollection must be true or false.');
  }
  return {
    name,
    slug,
    parentId: body?.parentId === undefined ? undefined : body.parentId || null,
    isFeaturedCollection: body?.isFeaturedCollection as boolean | undefined,
  };
}
