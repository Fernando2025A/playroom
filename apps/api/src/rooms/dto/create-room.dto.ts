import { Transform } from 'class-transformer';
import {
  IsBoolean,
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

  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    if (typeof value === 'number') return value === 1;
    return false;
  })
  @IsBoolean()
  @IsNotEmpty()
  isPublic: boolean;
}
