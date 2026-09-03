import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ElasticsearchService } from '../search/elasticsearch.service';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private prisma: PrismaService,
    private es: ElasticsearchService,
  ) {}

  async findAll(query: {
    search?: string;
    category?: string;
    material?: string;
    minPrice?: number;
    maxPrice?: number;
    isLimitedEdition?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const page  = Number(query.page)  || 1;
    const limit = Number(query.limit) || 24;
    const isLimitedEditionFilter = query.isLimitedEdition === 'true' ? true : undefined;

    // ── Try Elasticsearch first ──────────────────────────────────────────────
    if (this.es.isAvailable()) {
      const esResult = await this.es.search({
        search:          query.search,
        material:        query.material,
        categorySlug:    query.category,
        minPrice:        query.minPrice ? Number(query.minPrice) : undefined,
        maxPrice:        query.maxPrice ? Number(query.maxPrice) : undefined,
        isLimitedEdition: isLimitedEditionFilter,
        sort:            query.sort,
        page,
        limit,
      });

      if (esResult !== null) {
        // Fetch full records from Postgres using the IDs returned by ES (must be PUBLISHED and active)
        const products = await this.prisma.product.findMany({
          where: { id: { in: esResult.ids }, isActive: true, status: ProductStatus.PUBLISHED },
          include: { category: true, variants: true },
        });

        // Preserve ES ordering
        const ordered = esResult.ids
          .map((id) => products.find((p) => p.id === id))
          .filter(Boolean);

        return {
          data:  ordered,
          total: esResult.total,
          page,
          limit,
          source: 'elasticsearch',
        };
      }
    }

    // ── Postgres fallback (ES unreachable or returned null) ──────────────────
    this.logger.warn('Falling back to Postgres for product search');

    const where: any = { isActive: true, status: ProductStatus.PUBLISHED };

    if (query.search) {
      where.OR = [
        { name:               { contains: query.search, mode: 'insensitive' } },
        { description:        { contains: query.search, mode: 'insensitive' } },
        { craftsmanshipStory: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.category)  where.category = { slug: query.category };
    if (query.material)  where.material  = { equals: query.material, mode: 'insensitive' };
    if (isLimitedEditionFilter !== undefined) where.isLimitedEdition = isLimitedEditionFilter;

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      const min = Number(query.minPrice);
      const max = Number(query.maxPrice);
      if (Number.isFinite(min) || Number.isFinite(max)) {
        where.price = {};
        if (Number.isFinite(min)) where.price.gte = min;
        if (Number.isFinite(max)) where.price.lte = max;
      }
    }

    let orderBy: any = { createdAt: 'desc' };
    if (query.sort === 'price_asc')  orderBy = { price: 'asc' };
    if (query.sort === 'price_desc') orderBy = { price: 'desc' };
    if (query.sort === 'newest')     orderBy = { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where, orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { category: true, variants: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data, total, page, limit, source: 'postgres_fallback' };
  }

  async findBySlug(slug: string) {
    // Always reads from Postgres — source of truth, must be PUBLISHED
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true } } },
          where: { isApproved: true },
        },
      },
    });

    if (!product || product.status !== ProductStatus.PUBLISHED || !product.isActive) {
      throw new NotFoundException(`Product "${slug}" not found.`);
    }

    // Compute edition display string for limited edition products
    const editionDisplay =
      product.isLimitedEdition && product.editionNumber != null && product.editionTotal != null
        ? `${product.editionNumber} of ${product.editionTotal}`
        : null;

    return { ...product, editionDisplay };
  }

  async suggest(q: string) {
    if (!q || q.trim().length < 2) {
      return { products: [], collections: [], categories: [], articles: [] };
    }

    const query = q.trim().toLowerCase();

    const [products, categories, collections] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          isActive: true,
          status: ProductStatus.PUBLISHED,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { craftsmanshipStory: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 4,
        select: { id: true, name: true, slug: true, price: true, images: true, material: true },
      }),
      this.prisma.category.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        take: 3,
        select: { id: true, name: true, slug: true },
      }),
      this.prisma.collection.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        take: 3,
        select: { id: true, name: true, slug: true },
      }),
    ]);

    const articles = [
      { title: 'History of Spartan Warriors', slug: 'history-of-spartan-warriors' },
      { title: 'The Forging of Toledo Steel', slug: 'forging-toledo-steel' },
      { title: 'Armour Preservation & Care', slug: 'armour-preservation-care' },
    ].filter((a) => a.title.toLowerCase().includes(query));

    return { products, collections, categories, articles };
  }

  async getCategories() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async addReview(productId: string, data: { rating: number; comment?: string; userId: string }) {
    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5 stars.');
    }
    return this.prisma.review.create({ data: { productId, rating: data.rating, comment: data.comment, userId: data.userId } });
  }
}
