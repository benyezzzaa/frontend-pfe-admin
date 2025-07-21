import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commande } from './commande.entity';
import { LigneCommande } from '../lignecommande/lignecommande.entity';
import { Produit } from '../produit/produit.entity';
import { Promotion } from '../Promotion/promotion.entity';
import { HistoriqueCommande } from './historique-commande.entity';
import { Client } from '../client/client.entity'; // ✅ entité client

import { ClientModule } from '../client/client.module'; // ✅ module complet
import { CommandeService } from './commande.service';
import { CommandeController } from './commande.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Commande,
      LigneCommande,
      HistoriqueCommande,
      Produit,
      Promotion,
      Client, // ✅ entité ajoutée pour pouvoir injecter son repository
    ]),
    ClientModule, // ✅ pour pouvoir accéder aux services/repositories du module client
  ],
  controllers: [CommandeController],
  providers: [CommandeService],
  exports: [CommandeService],
})
export class CommandeModule {}
