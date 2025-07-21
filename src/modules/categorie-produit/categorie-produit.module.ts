// ✅ categorie-produit.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategorieProduit } from './categorie-produit.entity';
import { CategorieProduitService } from './categorie-produit.service';
import { CategorieProduitController } from './categorie-produit.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CategorieProduit])],
  providers: [CategorieProduitService],
  controllers: [CategorieProduitController],
})
export class CategorieProduitModule {}
