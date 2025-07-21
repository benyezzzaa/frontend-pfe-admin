// src/commande/dto/notification-commande.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ModificationDto {
  @ApiProperty()
  champ: string;

  @ApiProperty()
  ancienneValeur: string;

  @ApiProperty()
  nouvelleValeur: string;

  @ApiProperty()
  date: Date;
}

export class NotificationCommandeDto {
  @ApiProperty()
  commandeId: number;

  @ApiProperty()
  numeroCommande: string;

  @ApiProperty()
  date: Date;

  @ApiProperty({ type: [ModificationDto] })
  modifications: ModificationDto[];
}
