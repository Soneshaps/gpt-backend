import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { LoggerService } from '../logger';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType | null;
  private readonly logger: LoggerService;
  private readonly DEFAULT_TTL = 3600; // 1 hour in seconds
  private isUpstashRedis: boolean = false;
  private upstashUrl: string | undefined;
  private upstashToken: string | undefined;

  constructor() {
    this.logger = new LoggerService().setContext('RedisService');

    // Check if using Upstash Redis
    this.upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
    this.upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    this.isUpstashRedis = !!(this.upstashUrl && this.upstashToken);

    if (this.isUpstashRedis) {
      this.logger.log('Using Upstash Redis REST API');
      // For Upstash Redis, we'll use HTTP requests instead of Redis client
      this.client = null;
    } else {
      this.logger.log('Using traditional Redis connection');
      const redisHost = process.env.REDIS_HOST || 'localhost';
      const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

      this.client = createClient({
        url: `redis://${redisHost}:${redisPort}`,
      });

      this.client.on('error', (err) => {
        this.logger.error(`Redis client error: ${err.message}`, err.stack);
      });
    }
  }

  async onModuleInit() {
    try {
      if (!this.isUpstashRedis && this.client) {
        await this.client.connect();
        this.logger.log(`Connected to Redis`);
      } else if (this.isUpstashRedis) {
        this.logger.log(`Configured for Upstash Redis REST API`);
      }
    } catch (error) {
      this.logger.error(`Failed to connect to Redis: ${error.message}`);
    }
  }

  async onModuleDestroy() {
    try {
      if (!this.isUpstashRedis && this.client) {
        await this.client.quit();
        this.logger.log('Disconnected from Redis');
      }
    } catch (error) {
      this.logger.error(`Error disconnecting from Redis: ${error.message}`);
    }
  }

  private async upstashRequest(
    endpoint: string,
    method: string = 'GET',
    body?: any,
  ): Promise<any> {
    if (!this.isUpstashRedis || !this.upstashUrl || !this.upstashToken) {
      throw new Error('Upstash Redis not configured');
    }

    const url = `${this.upstashUrl}/${endpoint}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.upstashToken}`,
      'Content-Type': 'application/json',
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      this.logger.debug(
        `Upstash Redis ${method} ${endpoint}: ${JSON.stringify(result)}`,
      );
      return result;
    } catch (error) {
      this.logger.error(`Upstash Redis request failed: ${error.message}`);
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.isUpstashRedis) {
        this.logger.log(`Attempting to get key: ${key} from Upstash Redis`);
        const response = await this.upstashRequest(`get/${key}`);
        this.logger.log(
          `Upstash Redis get response: ${JSON.stringify(response)}`,
        );

        // Upstash Redis returns {result: stored_value} where stored_value is the JSON string we stored
        if (response.result && response.result !== 'null') {
          try {
            // Parse the stored value to get the actual cached data
            const parsedValue = JSON.parse(response.result);
            this.logger.log(`Cache hit for key: ${key}`);
            return parsedValue;
          } catch (parseError) {
            this.logger.error(
              `Error parsing cached value for key ${key}: ${parseError.message}`,
            );
            return null;
          }
        }
        this.logger.log(`Cache miss for key: ${key}`);
        return null;
      } else if (this.client) {
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
      }
      return null;
    } catch (error) {
      this.logger.error(`Error getting key ${key}: ${error.message}`);
      return null;
    }
  }

  async set(
    key: string,
    value: any,
    ttl: number = this.DEFAULT_TTL,
  ): Promise<void> {
    try {
      if (this.isUpstashRedis) {
        this.logger.log(
          `Attempting to set key: ${key} in Upstash Redis with TTL: ${ttl}`,
        );
        // For Upstash Redis, we need to send the value and TTL as query parameters, not in the body
        const url = `${this.upstashUrl}/set/${key}?ex=${ttl}`;
        const headers: Record<string, string> = {
          Authorization: `Bearer ${this.upstashToken}`,
          'Content-Type': 'application/json',
        };

        const options: RequestInit = {
          method: 'POST',
          headers,
          body: JSON.stringify(value),
        };

        this.logger.log(
          `Setting cache with URL: ${url} and body: ${JSON.stringify(value)}`,
        );
        const response = await fetch(url, options);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        this.logger.log(
          `Upstash Redis set response: ${JSON.stringify(result)}`,
        );

        if (result.result === 'OK') {
          this.logger.log(`Successfully cached: ${key} (TTL: ${ttl}s)`);
        } else {
          this.logger.error(
            `Failed to cache key ${key}: ${JSON.stringify(result)}`,
          );
        }
      } else if (this.client) {
        await this.client.set(key, JSON.stringify(value), { EX: ttl });
        this.logger.log(`Cached: ${key} (TTL: ${ttl}s)`);
      }
    } catch (error) {
      this.logger.error(`Error setting key ${key}: ${error.message}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (this.isUpstashRedis) {
        await this.upstashRequest(`del/${key}`, 'DELETE');
      } else if (this.client) {
        await this.client.del(key);
      }
      this.logger.debug(`Deleted: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting key ${key}: ${error.message}`);
    }
  }

  async flushAll(): Promise<void> {
    try {
      if (this.isUpstashRedis) {
        await this.upstashRequest('flushall', 'POST');
      } else if (this.client) {
        await this.client.flushAll();
      }
      this.logger.warn('Cache cleared');
    } catch (error) {
      this.logger.error(`Error clearing cache: ${error.message}`);
    }
  }

  // Simple key generator
  generateKey(prefix: string, params: Record<string, any> = {}): string {
    const filteredParams = {};

    // Filter out undefined/null values
    Object.keys(params).forEach((key) => {
      if (params[key] != null) {
        filteredParams[key] = params[key];
      }
    });

    // If no params, just return the prefix
    if (Object.keys(filteredParams).length === 0) {
      return prefix;
    }

    // Otherwise, append the JSON string of params
    return `${prefix}:${JSON.stringify(filteredParams)}`;
  }
}
