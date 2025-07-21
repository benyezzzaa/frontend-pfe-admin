import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { Column } from 'typeorm';

export class CreateClientDto {
  @ApiProperty({ example: 'Ali' })
  @IsOptional()
  @IsString()
  nom?: string;
 @ApiProperty({ example: 36.8065, required: false })
@IsOptional()
@IsNumber()
latitude?: number;

@ApiProperty({ example: 10.1815, required: false })
@IsOptional()
@IsNumber()
longitude?: number;
  @ApiProperty({ example: 'Ben Salah' })
  @IsOptional()
  @IsString()
  prenom?: string;

  @ApiProperty({ example: 'ali@example.com' })
  @IsOptional()
  @IsString()
  email?: string;

   @ApiProperty({ example: '0612345678', description: 'Numéro français valide (0XXXXXXXXX ou +33XXXXXXXXX)' })
@IsString()
@Matches(/^(?:\+33|0)[1-9]\d{8}$/, {
  message: 'Le numéro de téléphone doit être un numéro français valide (ex: 0612345678 ou +33612345678).',
})
telephone: string;

  @ApiProperty({ example: 'Rue de Tunis' })
  @IsOptional()
  @IsString()
  adresse?: string;
  @ApiProperty({ example: '1234567890123', description: 'Code fiscal (13 chiffres)' })
@IsOptional()
@IsString()
codeFiscale?: string;
  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  estFidele?: boolean;
  @IsOptional()
@IsNumber()
categorieId?: number; // ID de la catégorie
}
