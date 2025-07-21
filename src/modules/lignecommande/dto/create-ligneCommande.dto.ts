// src/modules/lignecommande/dto/create-ligneCommande.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class LigneCommandeDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  numero_commande: string;

  @ApiProperty()
  nom_produit: string;

  @ApiProperty()
  quantite: number;

  @ApiProperty()
  prix_unitaire: number;
}
