import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePromotionDto {
  @ApiProperty({ example: 'Promo Été', description: 'Titre de la promotion' })
  @IsString()
  titre: string;

  @ApiProperty({ example: 'Jusqu’à 20% de réduction sur tous les produits' })
  @IsString()
  description: string;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(0, { message: 'Le taux de réduction ne peut pas être négatif.' })
  tauxReduction: number;

  @ApiProperty({ example: '2024-06-01', format: 'date' })
  @IsDateString()
  dateDebut: Date;

  @ApiProperty({ example: '2024-06-30', format: 'date' })
  @IsDateString()
  dateFin: Date;
  @IsOptional()
  @IsInt()
  promotionId?: number;
}
