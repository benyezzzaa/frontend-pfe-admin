import { IsOptional, IsNumber, IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateLigneCommandeDto {
  @IsNumber()
  id: number; // ✅ ID obligatoire pour retrouver la ligne

  @IsOptional()
  @IsNumber()
  quantite?: number;
}

export class UpdateCommandeDto {
   @IsArray()
  lignesCommande: {
    id: number;
    quantite: number;
  }[];

  @IsInt()
  modifiePar: number;
}

