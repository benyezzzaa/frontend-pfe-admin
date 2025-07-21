import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProduitDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  prix_unitaire?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tva?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  colisage?: number;

  @IsOptional()
  categorieId?: string;

  @IsOptional()
  uniteId?: string;
}
