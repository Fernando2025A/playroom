/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { UpdateGameInput } from './dto/update-game.input';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly gameService: GameService) {}

  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('mensaje')
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    console.log(data);
    //this.server.emit('mensajeserver', data);
    client.broadcast.emit('mensajeserver', data);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomCode: string,
  ) {
    await client.join(roomCode);

    console.log(`${client.id} joined to room ${roomCode}`);
  }

  @SubscribeMessage('updateGame')
  async handleUpdateGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: UpdateGameInput,
  ) {
    const game = await this.gameService.update(data);

    this.server.to(game.roomCode).emit('gameUpdated', game);

    return game;
  }
}
