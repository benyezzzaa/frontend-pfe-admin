// src/modules/lignecommande/dto/create-ligneCommande.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsPositive } from 'class-validator';

export class updateLigneCommandeDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  numero_commande: string;

  @ApiProperty()
  nom_produit: string;

  @ApiProperty({ required: true, example: 5 })
  @IsNumber()
  @IsPositive()
  @IsInt()  
  quantite: number;

 @ApiProperty({ required: true, example: 10.99 })
  @IsNumber()
  @IsPositive()
  prix_unitaire: number;
}
