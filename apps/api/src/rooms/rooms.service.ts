import { Injectable, NotFoundException } from '@nestjs/common';
import { Player, Room } from '@playroom/types';
import { randomUUID } from 'crypto';
import { customAlphabet } from 'nanoid';
import { RedisService } from 'src/redis/redis.service';
import { CreateRoomDto } from './dto/create-room.dto';

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
// Instanciamos el generador una sola vez fuera del servicio
const generateRoomCode = customAlphabet(ALPHABET, 6);

@Injectable()
export class RoomsService {
  private readonly DEFAULT_TTL = 8400;
  constructor(private readonly redisService: RedisService) {}

  async createRoom(dto: CreateRoomDto): Promise<Room> {
    const { roomName, maxPlayers, ownerId } = dto;
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

    const roomId = randomUUID();
    const redisKey = `room_id:${roomId}`;

    const room: Room = {
      name: roomName,
      code: generateRoomCode(), // Llamamos a la función
      maxPlayers,
      ownerId,
      players: [owner], // Guardamos el objeto limpio
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

    const rooms = await this.redisService.get(`room_id:${owner.roomCode}`);
    return rooms;
  }
}
