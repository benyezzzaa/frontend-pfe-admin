import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { Column } from 'typeorm';

export class CreateClientDto {
  @ApiProperty({ example: 'Entreprise ABC SARL' })
  @IsOptional()
  @IsString()
  nom?: string;

  @ApiProperty({ example: 'Ali Ben Salah' })
  @IsOptional()
  @IsString()
  prenom?: string;
 @ApiProperty({ example: 36.8065, required: false })
@IsOptional()
@IsNumber()
latitude?: number;

@ApiProperty({ example: 10.1815, required: false })
@IsOptional()
@IsNumber()
longitude?: number;
  @ApiProperty({ example: 'Ali Ben Salah' })
  @IsOptional()
  @IsString()
  responsable?: string;

  @ApiProperty({ example: 'ali@example.com' })
  @IsOptional()
  @IsString()
  email?: string;

   @ApiProperty({ example: '06 12 34 56 78', description: 'Numéro français valide (avec ou sans espaces)' })
@IsString()
@Matches(/^(?:\+33|0)[1-9]\d{8}$/, {
  message: 'Le numéro de téléphone doit être un numéro français valide (ex: 06 12 34 56 78 ou +33 6 12 34 56 78).',
})
telephone: string;

  @ApiProperty({ example: 'Rue de Tunis' })
  @IsOptional()
  @IsString()
  adresse?: string;
  @ApiProperty({ 
    example: '12345678901234', 
    description: 'SIRET (14 chiffres) - Numéro fiscal français' 
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{14}$/, {
    message: 'Le SIRET doit contenir exactement 14 chiffres.',
  })
  codeFiscale?: string;
  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  estFidele?: boolean;
  @IsOptional()
@IsNumber()
categorieId?: number; // ID de la catégorie
}
