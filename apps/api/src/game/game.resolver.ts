import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { GameService } from './game.service';
import { Game } from './entities/game.entity';
import { UpdateGameInput } from './dto/update-game.input';

@Resolver(() => Game)
export class GameResolver {
  constructor(private readonly gameService: GameService) {}

  @Mutation(() => Game)
  createGame(@Args('roomCode', { type: () => String }) roomCode: string) {
    return this.gameService.create(roomCode);
  }

  @Mutation(() => Game)
  updateGame(@Args('updateGameInput') updateGameInput: UpdateGameInput) {
    return this.gameService.update(updateGameInput);
  }

  @Query(() => String)
  health(): string {
    return 'ok';
  }
}
