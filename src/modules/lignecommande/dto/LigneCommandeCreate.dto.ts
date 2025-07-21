import { ApiProperty } from "@nestjs/swagger";

// 🔥 Et tu ajoutes ce DTO aussi
export class LigneCommandeCreateDto {
    @ApiProperty()
    produitId: number;
  
    @ApiProperty()
    quantite: number;
  }
  