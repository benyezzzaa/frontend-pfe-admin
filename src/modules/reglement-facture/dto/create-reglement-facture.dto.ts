import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsDate } from 'class-validator';

export class CreateReglementFactureDto {
  @ApiProperty({ example: 1, description: 'Identifiant du règlement' })
  @IsNumber()
  @IsNotEmpty()
  reglementId: number;

  @ApiProperty({ example: 1, description: 'Identifiant de la facture associée' })
  @IsNumber()
  @IsNotEmpty()
  factureId: number;

  @ApiProperty({ example: 200.50, description: 'Montant payé pour cette facture' })
  @IsNumber()
  @IsNotEmpty()
  montantPaye: number;

  @ApiProperty({ example: '2025-03-18', description: 'Date du règlement' })
  @IsDate()
  @IsNotEmpty()
  dateReglement: Date;
}
