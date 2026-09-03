import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private inMemoryFallback = new Map<string, string>();

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (redisUrl) {
      try {
        this.client = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 });
        this.client.connect().then(() => {
          this.logger.log('Connected to Redis server.');
        }).catch((err) => {
          this.logger.warn(`Redis connection failed (${err.message}). Using in-memory fallback.`);
          this.client = null;
        });
      } catch (err) {
        this.logger.warn(`Failed to initialize Redis client: ${err.message}. Using fallback.`);
      }
    } else {
      this.logger.log('REDIS_URL not configured. Operating with in-memory fallback cache.');
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.client) {
      try {
        return await this.client.get(key);
      } catch {
        return this.inMemoryFallback.get(key) || null;
      }
    }
    return this.inMemoryFallback.get(key) || null;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.client) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, value);
        }
        return;
      } catch (err) {
        this.logger.warn(`Redis set error (${err.message}), using fallback.`);
      }
    }
    this.inMemoryFallback.set(key, value);
  }

  async del(key: string): Promise<void> {
    if (this.client) {
      try {
        await this.client.del(key);
        return;
      } catch {
        // fallback
      }
    }
    this.inMemoryFallback.delete(key);
  }
}
