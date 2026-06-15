import { getDb } from '@/lib/mongodb';

// Production Redis Caching Layer with safe MongoDB Fallback
class RedisCache {
  private client: any = null;

  constructor() {
    // Dynamically require ioredis if Redis coordinates are provided in environment
    if (process.env.REDIS_URL || process.env.REDIS_HOST) {
      try {
        const Redis = require('ioredis');
        this.client = new Redis(process.env.REDIS_URL || {
          host: process.env.REDIS_HOST || '127.0.0.1',
          port: Number(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD || undefined
        });
        console.log("Redis cache initialized successfully.");
      } catch (err) {
        console.warn("Redis dependency not loaded or credentials invalid, falling back to database query logs.");
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) return null;
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error("Redis get cache failure, key:", key, err);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds = 300): Promise<boolean> {
    if (!this.client) return false;
    try {
      const serialized = JSON.stringify(value);
      await this.client.set(key, serialized, 'EX', ttlSeconds);
      return true;
    } catch (err) {
      console.error("Redis set cache failure, key:", key, err);
      return false;
    }
  }

  async invalidate(key: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.del(key);
    } catch (err) {
      console.error("Redis invalidate cache failure, key:", key, err);
    }
  }
}

export const redisCache = new RedisCache();
