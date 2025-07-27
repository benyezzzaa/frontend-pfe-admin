import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUniteDto {
  @IsNotEmpty({ message: "Le nom de l'unité est requis" })
  @IsString()
  nom: string;
  uniteId: number; 
}
