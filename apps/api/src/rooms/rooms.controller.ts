import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get(':playerId')
  getMyRooms(@Param('playerId') playerId: string) {
    return this.roomsService.getMyRoom(playerId);
  }

  @Post()
  createRoom(@Body() dto: CreateRoomDto) {
    return this.roomsService.createRoom(dto);
  }

  @Post('join')
  joinRoom(@Body() dto: JoinRoomDto) {
    return this.roomsService.joinRoom(dto);
  }
}
