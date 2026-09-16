import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { Game, GamePlayer, Room } from '@playroom/types';
import { randomUUID } from 'crypto';
import { UpdateGameInput } from './dto/update-game.input';

@Injectable()
export class GameService {
  private readonly DEFAULT_TTL = 8400;
  private readonly BOARD_SIZE = 50;
  constructor(private readonly redisService: RedisService) {}

  async create(roomCode: string) {
    const roomRaw = await this.validateRoom(roomCode);

    const room = JSON.parse(roomRaw) as Room;

    const gameId = randomUUID();
    const redisKey = `game_id:${gameId}`;

    const gamePlayers: GamePlayer[] = [];

    room.players.forEach((value) => {
      gamePlayers.push({ playerId: value.id, position: 1 });
    });

    const game: Game = {
      currentPlayerId: room.players[0].id,
      id: gameId,
      roomCode: room.code,
      round: 0,
      status: 'playing',
      turn: 1,
      players: gamePlayers,
    };

    await this.redisService.set(
      redisKey,
      JSON.stringify(game),
      this.DEFAULT_TTL,
    );

    return game;
  }

  async update(updateGameInput: UpdateGameInput) {
    const { gameCode, playerId } = updateGameInput;
    const gameRaw = await this.validateGame(gameCode, playerId);

    const game = JSON.parse(gameRaw) as Game;

    if (game.status !== 'playing')
      throw new BadRequestException('La partida ya terminó');

    if (game.currentPlayerId !== playerId)
      throw new BadRequestException('No es el turno de este jugador');

    const randomNum = Math.floor(Math.random() * 6) + 1;

    const player = game.players.find((p) => p.playerId === playerId);

    if (!player) throw new BadRequestException('No se pudo obtener el jugador');

    const newPosition = player.position + randomNum;
    const hasWinner = newPosition >= this.BOARD_SIZE;
    const currentPlayerIndex = game.players.findIndex(
      (gamePlayer) => gamePlayer.playerId === playerId,
    );
    const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;

    const updatedGame: Game = {
      ...game,
      currentPlayerId: hasWinner
        ? playerId
        : game.players[nextPlayerIndex].playerId,
      round: hasWinner || nextPlayerIndex !== 0 ? game.round : game.round + 1,
      status: hasWinner ? 'closed' : 'playing',
      turn: game.turn + 1,
      winnerId: hasWinner ? playerId : undefined,
      players: game.players.map((gamePlayer) =>
        gamePlayer.playerId === playerId
          ? { ...gamePlayer, position: Math.min(newPosition, this.BOARD_SIZE) }
          : gamePlayer,
      ),
    };

    await this.redisService.set(
      `game_id:${game.id}`,
      JSON.stringify(updatedGame),
      this.DEFAULT_TTL,
    );

    return updatedGame;
  }

  private async validateRoom(roomCode: string, playerId?: string) {
    const roomRaw =
      (await this.redisService.get(`room_id:${roomCode}`)) ??
      (await this.redisService.get(`room_code:${roomCode}`));

    if (!roomRaw)
      throw new NotFoundException('No se encontró la sala solicitada');

    if (playerId) {
      const room = JSON.parse(roomRaw) as Room;
      const playerInRoom = room.players.find((p) => p.id === playerId);

      if (!playerInRoom)
        throw new BadRequestException('El jugador no se encuentra en la sala');

      return roomRaw;
    }

    return roomRaw;
  }

  private async validateGame(gameId: string, playerId: string) {
    const gameRaw = await this.redisService.get(`game_id:${gameId}`);

    if (!gameRaw) {
      throw new NotFoundException('No se encontró una partida solicitada');
    }

    const game = JSON.parse(gameRaw) as Game;

    const playerInGame = game.players.find((p) => p.playerId === playerId);

    if (!playerInGame) {
      throw new BadRequestException('El jugador no se encuentra en la partida');
    }

    return gameRaw;
  }
}
