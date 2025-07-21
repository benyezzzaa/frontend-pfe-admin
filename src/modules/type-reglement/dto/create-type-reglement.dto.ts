import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTypeReglementDto {
  @ApiProperty({ example: 'Carte bancaire', description: 'Type de règlement' })
  @IsString()
  @IsNotEmpty()
  nom: string;
}
