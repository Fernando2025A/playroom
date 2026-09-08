import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import type { Player } from '@playroom/types';
import { randomUUID } from 'crypto';

@Injectable()
export class PlayersService {
  private readonly DEFAULT_TTL = 86400;
  constructor(private readonly redisService: RedisService) {}

  async createPlayer(
    username: string,
    ttlInSeconds = this.DEFAULT_TTL,
  ): Promise<Player> {
    const userId = randomUUID();
    const redisKey = `user_id:${userId}`;

    const user: Player = {
      id: userId,
      username,
      status: 'online',
      createdAt: new Date().toISOString(),
    };

    await this.redisService.set(redisKey, JSON.stringify(user), ttlInSeconds);

    return user;
  }
}
