import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';

const INDEX = 'products';

const MAPPINGS = {
  properties: {
    id:                  { type: 'keyword' },
    name:                { type: 'text', fields: { keyword: { type: 'keyword' } } },
    description:         { type: 'text' },
    craftsmanshipStory:  { type: 'text' },
    material:            { type: 'keyword' },
    categorySlug:        { type: 'keyword' },
    price:               { type: 'float' },
    stock:               { type: 'integer' },
    isActive:            { type: 'boolean' },
    status:              { type: 'keyword' },
    isLimitedEdition:    { type: 'boolean' },
    isGiftEligible:      { type: 'boolean' },
    createdAt:           { type: 'date' },
  },
};

export interface EsProductDoc {
  id: string;
  name: string;
  description: string;
  craftsmanshipStory?: string;
  material?: string;
  categorySlug: string;
  price: number;
  stock: number;
  isActive: boolean;
  status: string;
  isLimitedEdition: boolean;
  isGiftEligible: boolean;
  createdAt: string;
}

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly logger = new Logger(ElasticsearchService.name);
  private client: Client | null = null;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const url = this.configService.get<string>('ELASTICSEARCH_URL', 'http://localhost:9200');
    try {
      this.client = new Client({ node: url });
      await this.ensureIndex();
      this.logger.log(`Connected to Elasticsearch at ${url}`);
    } catch (err) {
      this.logger.warn(`Elasticsearch unavailable at ${url} — search will fall back to Postgres. Error: ${(err as Error).message}`);
      this.client = null;
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  private async ensureIndex() {
    if (!this.client) return;
    const exists = await this.client.indices.exists({ index: INDEX });
    if (!exists) {
      await this.client.indices.create({ index: INDEX, mappings: MAPPINGS as any });
      this.logger.log(`Created Elasticsearch index "${INDEX}"`);
    }
  }

  async indexProduct(doc: EsProductDoc): Promise<void> {
    if (!this.client) return;
    try {
      if (doc.status !== 'PUBLISHED' || !doc.isActive) {
        await this.deleteProduct(doc.id);
        return;
      }
      await this.client.index({ index: INDEX, id: doc.id, document: doc });
    } catch (err) {
      this.logger.warn(`ES index failed for product ${doc.id}: ${(err as Error).message}`);
    }
  }

  async deleteProduct(id: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.delete({ index: INDEX, id });
    } catch (err) {
      // Ignore 404
    }
  }

  async search(params: {
    search?: string;
    material?: string;
    categorySlug?: string;
    minPrice?: number;
    maxPrice?: number;
    isLimitedEdition?: boolean;
    sort?: string;
    page: number;
    limit: number;
  }): Promise<{ ids: string[]; total: number } | null> {
    if (!this.client) return null;

    try {
      const must: any[] = [{ term: { isActive: true } }, { term: { status: 'PUBLISHED' } }];

      if (params.search) {
        must.push({
          multi_match: {
            query: params.search,
            fields: ['name^3', 'description', 'craftsmanshipStory'],
            fuzziness: 'AUTO',
          },
        });
      }

      if (params.categorySlug) {
        must.push({ term: { categorySlug: params.categorySlug } });
      }

      if (params.material) {
        must.push({ term: { material: params.material } });
      }

      if (params.isLimitedEdition !== undefined) {
        must.push({ term: { isLimitedEdition: params.isLimitedEdition } });
      }

      if (params.minPrice !== undefined || params.maxPrice !== undefined) {
        const range: any = {};
        if (params.minPrice !== undefined) range.gte = params.minPrice;
        if (params.maxPrice !== undefined) range.lte = params.maxPrice;
        must.push({ range: { price: range } });
      }

      let sort: any[] = [{ createdAt: { order: 'desc' } }];
      if (params.sort === 'price_asc') sort = [{ price: { order: 'asc' } }];
      if (params.sort === 'price_desc') sort = [{ price: { order: 'desc' } }];
      if (params.sort === 'newest') sort = [{ createdAt: { order: 'desc' } }];

      const res = await this.client.search({
        index: INDEX,
        query: { bool: { must } },
        sort,
        from: (params.page - 1) * params.limit,
        size: params.limit,
      });

      const hits = res.hits.hits;
      const total = typeof res.hits.total === 'number' ? res.hits.total : (res.hits.total as any)?.value ?? 0;
      const ids = hits.map((h) => h._id);

      return { ids, total };
    } catch (err) {
      this.logger.warn(`ES search failed: ${(err as Error).message} — falling back to Postgres`);
      return null;
    }
  }

  async bulkIndex(docs: EsProductDoc[]): Promise<void> {
    if (!this.client || docs.length === 0) return;
    try {
      const validDocs = docs.filter((d) => d.status === 'PUBLISHED' && d.isActive);
      const operations = validDocs.flatMap((doc) => [{ index: { _index: INDEX, _id: doc.id } }, doc]);
      if (operations.length > 0) {
        await this.client.bulk({ refresh: true, operations });
      }
    } catch (err) {
      this.logger.warn(`ES bulk index failed: ${(err as Error).message}`);
    }
  }
}
