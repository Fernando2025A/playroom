import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Player, Room } from '@playroom/types';
import { customAlphabet } from 'nanoid';
import { RedisService } from 'src/redis/redis.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
// Instanciamos el generador una sola vez fuera del servicio
const generateRoomCode = customAlphabet(ALPHABET, 6);

@Injectable()
export class RoomsService {
  private readonly DEFAULT_TTL = 8400;
  constructor(private readonly redisService: RedisService) {}

  async createRoom(dto: CreateRoomDto) {
    const { roomName, maxPlayers, ownerId, isPublic } = dto;
    const ownerRaw = await this.redisService.get(`user_id:${ownerId}`);

    if (!ownerRaw) {
      throw new NotFoundException(
        'No se encontró un jugador con la ID proporcionada',
      );
    }

    // Parseamos el string JSON a un objeto Player real
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const owner: Player = JSON.parse(ownerRaw);

    await this.redisService.del(`room_id:${owner.roomCode}`);

    const roomId = generateRoomCode();
    const redisKey = `room_id:${roomId}`;

    const room: Room = {
      name: roomName,
      code: roomId, // Llamamos a la función
      maxPlayers,
      ownerId,
      players: [owner], // Guardamos el objeto limpio
      isPublic,
      status: 'waiting',
    };

    await this.redisService.set(
      redisKey,
      JSON.stringify(room),
      this.DEFAULT_TTL,
    );

    return room;
  }

  async getMyRoom(playerId: string) {
    const ownerRaw = await this.redisService.get(`user_id:${playerId}`);

    if (!ownerRaw) {
      throw new NotFoundException(
        'No se encontró un jugador con la id proporcionada',
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const owner: Player = JSON.parse(ownerRaw);

    const room = await this.redisService.get(`room_id:${owner.roomCode}`);
    return room;
  }

  async joinRoom(dto: JoinRoomDto) {
    const { roomId, playerId } = dto;
    const playerRaw = await this.redisService.get(`user_id:${playerId}`);

    if (!playerRaw)
      throw new NotFoundException(
        'No se encontró un jugador con la id proporcionada',
      );

    const roomRaw = await this.redisService.get(`room_id:${roomId}`);

    if (!roomRaw)
      throw new NotFoundException(
        'No se encontró una sala con la id proporcionada',
      );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const room: Room = JSON.parse(roomRaw);

    if (!room.isPublic)
      throw new UnauthorizedException('La sala solicitada es privada');

    if (room.players.length + 1 > room.maxPlayers)
      throw new BadRequestException('La sala ya está llena');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const player: Player = JSON.parse(playerRaw);

    const players: Player[] = room.players;

    const playerInRoom = players.find((value) => value.id === playerId);

    if (playerInRoom)
      throw new BadRequestException('Ya estás en la sala solicitada');

    const updatedRoom: Room = {
      code: room.code,
      isPublic: true,
      maxPlayers: room.maxPlayers,
      name: room.name,
      ownerId: room.ownerId,
      players: [...room.players, player],
      status: 'waiting',
    };

    const updatedPlayer: Player = {
      id: player.id,
      status: 'online',
      username: player.username,
      roomCode: room.code,
      createdAt: player.createdAt,
    };

    await this.redisService.set(
      `user_id:${player.id}`,
      JSON.stringify(updatedPlayer),
      86400,
    );
    await this.redisService.set(
      `room_id:${room.code}`,
      JSON.stringify(updatedRoom),
      this.DEFAULT_TTL,
    );

    return updatedRoom;
  }
}
