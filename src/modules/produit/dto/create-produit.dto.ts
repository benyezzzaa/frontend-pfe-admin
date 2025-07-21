// ✅ DTO - create-produit.dto.ts
import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProduitDto {
  @IsNotEmpty()
  @IsString()
  nom: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  

@IsNotEmpty()
@Type(() => Number)
@IsNumber()
@Min(0)
tva: number;

@IsNotEmpty()
@Type(() => Number)
@IsNumber()
@Min(1)
colisage: number;

 @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Le prix unitaire doit être supérieur ou égal à 0.' })
  prix_unitaire: number;

  @IsNotEmpty()
  @IsString()
  categorieId: string;

  @IsNotEmpty()
  @IsString()
  uniteId: string; // ⚠️ string car c'est le nom de l'unité
}
