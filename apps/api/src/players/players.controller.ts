import { Body, Controller, Post } from '@nestjs/common';
import { PlayersService } from './players.service';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  createPlayer(@Body('username') username: string) {
    return this.playersService.createPlayer(username);
  }
}
