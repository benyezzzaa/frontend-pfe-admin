// src/modules/client/DTO/create-categorie-client.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategorieClientDto {
  @IsString()
  @IsNotEmpty()
  nom: string;
}
