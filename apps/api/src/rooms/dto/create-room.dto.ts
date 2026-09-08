import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @Length(3, 30)
  @IsNotEmpty()
  roomName: string;

  @IsNumber()
  @Max(4)
  @Min(2)
  @IsNotEmpty()
  maxPlayers: number;

  @IsString()
  @IsNotEmpty()
  ownerId: string;
}
