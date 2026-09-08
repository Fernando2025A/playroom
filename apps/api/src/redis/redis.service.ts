import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  private readonly client: RedisClientType = createClient({
    url: process.env.REDIS_URL,
  });

  async onModuleInit() {
    this.client.on('error', (error) => {
      this.logger.error(`Redis error: ${error.message}`);
    });

    await this.client.connect();

    this.logger.log('Connected to Redis');
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async set(key: string, value: string, expirationInSeconds?: number) {
    if (expirationInSeconds) {
      await this.client.set(key, value, {
        EX: expirationInSeconds,
      });

      return;
    }

    await this.client.set(key, value);
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async del(key: string) {
    return this.client.del(key);
  }

  async expire(key: string, seconds: number) {
    return this.client.expire(key, seconds);
  }

  async exists(key: string) {
    return this.client.exists(key);
  }
}
