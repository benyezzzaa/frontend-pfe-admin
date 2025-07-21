// src/modules/ObjectifCommercial/DTO/create-objectif.dto.ts
import { IsNotEmpty, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateObjectifDto {
  @IsOptional()
  commercialId?: number;

  @IsNumber()
  montantCible: number;

  @IsNumber()
  prime: number;

  @IsOptional()
  mission?: string;

  @IsDateString()
  dateDebut: string;

  @IsDateString()
  dateFin: string;
}

export class CreateObjectifGlobalDto {
  @IsNumber()
  montantCible: number;

  @IsNumber()
  prime: number;

  @IsOptional()
  mission?: string;

  @IsDateString()
  dateDebut: string;

  @IsDateString()
  dateFin: string;
}
