import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateReglementDto {
  @ApiProperty()
  @IsNumber()
  montant: number;

  @ApiProperty()
  @IsNumber()
  montantPaye: number;

  @ApiProperty()
  @IsString()
  mode_paiement: string;

  @ApiProperty()
  @IsDateString()
  datePaiement: string; // format ISO: "2024-04-08"

  @ApiProperty()
  @IsString()
  statut: string;

  @ApiProperty({ required: false })
  @IsOptional()
  typeReglementId?: number;
}
