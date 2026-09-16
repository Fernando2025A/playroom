import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class UpdateGameInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  gameCode: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  playerId: string;
}
