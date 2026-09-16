import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Game {
  @Field()
  id: string;

  @Field()
  roomCode: string;

  @Field()
  status: string;

  @Field()
  turn: number;

  @Field()
  currentPlayerId: string;

  @Field()
  round: number;

  @Field(() => [GamePlayer])
  players: GamePlayer[];

  @Field({ nullable: true })
  winnerId?: string;
}

@ObjectType()
export class GamePlayer {
  @Field()
  playerId: string;

  @Field()
  position: number;
}
