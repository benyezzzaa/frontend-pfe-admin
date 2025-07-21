import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Produit } from './produit.entity';
import { ProduitService } from './produit.service';
import { ProduitController } from './produit.controller';
import { CategorieProduit } from '../categorie-produit/categorie-produit.entity';
import { Unite } from '../unite/unite.entity'; // ✅ Import de l'entité Unite
import { UniteService } from '../unite/unite.service';
@Module({
  
  imports: [TypeOrmModule.forFeature([Produit, CategorieProduit, Unite])],
  providers: [ProduitService,UniteService],
  controllers: [ProduitController],
  exports: [ProduitService], // 🔥 Assurez-vous que le service est bien exporté
})
export class ProduitModule {} 