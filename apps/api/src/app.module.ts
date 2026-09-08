import { Module } from '@nestjs/common';
import { RedisModule } from './redis/redis.module';
import { RoomsModule } from './rooms/rooms.module';
import { PlayersModule } from './players/players.module';

@Module({
  imports: [RedisModule, RoomsModule, PlayersModule],
})
export class AppModule {}
