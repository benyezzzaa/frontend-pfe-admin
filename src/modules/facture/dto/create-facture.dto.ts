import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsDate } from 'class-validator';

export class CreateFactureDto {
  @ApiProperty({ example: 'FAC-2025001', description: 'Numéro unique de la facture' })
  @IsString()
  @IsNotEmpty()
  numeroFacture: string;

  @ApiProperty({ example: 500.99, description: 'Montant total de la facture' })
  @IsNumber()
  @IsNotEmpty()
  montantTotal: number;

  @ApiProperty({ example: '2025-03-17', description: 'Date d’émission de la facture' })
  @IsDate()
  @IsNotEmpty()
  dateEmission: Date;

  @ApiProperty({ example: 1, description: 'Identifiant de la commande associée' })
  @IsNumber()
  @IsNotEmpty()
  commandeId: number;
  @ApiProperty({ example: 250.50, description: 'Prix total de la facture' })
  @IsNumber()
  @IsNotEmpty()
  prixTotal: number;
  @ApiProperty({ example: 'Avoir', description: 'Type de facture' })
  @IsString()
  @IsNotEmpty()
  type: string;

}
