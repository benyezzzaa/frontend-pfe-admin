import { IsInt, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVisiteDto {
  @ApiProperty()
  @IsDateString()
  date: Date;

  @ApiProperty()
  @IsInt()
  clientId: number;

  @ApiProperty()
  @IsInt()
  raisonId: number;
}
