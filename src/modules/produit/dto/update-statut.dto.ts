// src/modules/produit/dto/update-statut.dto.ts
import { IsBoolean } from 'class-validator';

export class UpdateStatutDto {
  @IsBoolean()
  isActive: boolean;
  
}
