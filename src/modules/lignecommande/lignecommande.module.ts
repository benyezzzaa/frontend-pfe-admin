import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LigneCommande } from './lignecommande.entity';
import { LigneCommandeService } from './lignecommande.service';
import { LigneCommandeController } from './lignecommande.controller';
import { CommandeModule } from '../commande/commande.module';

@Module({
  imports: [TypeOrmModule.forFeature([LigneCommande]),CommandeModule],
  controllers: [LigneCommandeController],
  providers: [LigneCommandeService],
})
export class LigneCommandeModule {}
