import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { RedisService } from '../redis/redis.service';

describe('GameService', () => {
  let service: GameService;
  const redisService = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        {
          provide: RedisService,
          useValue: redisService,
        },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a game with every player at position 1', async () => {
    redisService.get.mockResolvedValue(
      JSON.stringify({
        code: 'ROOM01',
        players: [{ id: 'player-1' }, { id: 'player-2' }],
      }),
    );

    const game = await service.create('ROOM01');

    expect(game).toMatchObject({
      roomCode: 'ROOM01',
      currentPlayerId: 'player-1',
      status: 'playing',
      players: [
        { playerId: 'player-1', position: 1 },
        { playerId: 'player-2', position: 1 },
      ],
    });
    expect(redisService.set).toHaveBeenCalledWith(
      expect.stringMatching(/^game_id:/),
      JSON.stringify(game),
      8400,
    );
  });

  it('moves the current player and passes the turn', async () => {
    const game = {
      id: 'game-1',
      roomCode: 'ROOM01',
      status: 'playing',
      turn: 1,
      currentPlayerId: 'player-1',
      round: 0,
      players: [
        { playerId: 'player-1', position: 10 },
        { playerId: 'player-2', position: 1 },
      ],
    };
    redisService.get.mockResolvedValue(JSON.stringify(game));
    jest.spyOn(Math, 'random').mockReturnValue(2 / 6);

    const updatedGame = await service.update('game-1', 'player-1');

    expect(updatedGame).toMatchObject({
      currentPlayerId: 'player-2',
      turn: 2,
      status: 'playing',
      players: [
        { playerId: 'player-1', position: 13 },
        { playerId: 'player-2', position: 1 },
      ],
    });
    expect(redisService.set).toHaveBeenCalledWith(
      'game_id:game-1',
      JSON.stringify(updatedGame),
      8400,
    );
    jest.restoreAllMocks();
  });

  it('closes the game when a player reaches or passes position 50', async () => {
    const game = {
      id: 'game-1',
      roomCode: 'ROOM01',
      status: 'playing',
      turn: 8,
      currentPlayerId: 'player-1',
      round: 3,
      players: [{ playerId: 'player-1', position: 48 }],
    };
    redisService.get.mockResolvedValue(JSON.stringify(game));
    jest.spyOn(Math, 'random').mockReturnValue(5 / 6);

    const updatedGame = await service.update('game-1', 'player-1');

    expect(updatedGame).toMatchObject({
      currentPlayerId: 'player-1',
      status: 'closed',
      winnerId: 'player-1',
      players: [{ playerId: 'player-1', position: 50 }],
    });
    jest.restoreAllMocks();
  });

  it('rejects a move when it is not the current player turn', async () => {
    redisService.get.mockResolvedValue(
      JSON.stringify({
        id: 'game-1',
        status: 'playing',
        currentPlayerId: 'player-1',
        players: [{ playerId: 'player-2', position: 1 }],
      }),
    );

    await expect(service.update('game-1', 'player-2')).rejects.toThrow(
      'No es el turno de este jugador',
    );
  });
});
