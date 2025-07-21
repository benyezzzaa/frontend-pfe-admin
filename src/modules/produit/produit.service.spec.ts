import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produit } from './produit.entity';
import { CreateProduitDto } from './dto/create-produit.dto';
import { CategorieProduit } from '../categorie-produit/categorie-produit.entity';

@Injectable()
export class ProduitService {
  constructor(
    @InjectRepository(Produit)
    private produitRepository: Repository<Produit>,

    @InjectRepository(CategorieProduit)
    private categorieProduitRepository: Repository<CategorieProduit>,
  ) {}

  async createProduit(dto: CreateProduitDto, imageFilename?: string) {
    let categorie = await this.categorieProduitRepository.findOne({
      where: { nom: dto.categorieId },
    });

    // 🔥 Si la catégorie n'existe pas, on la crée
    if (!categorie) {
      categorie = this.categorieProduitRepository.create({ nom: dto.categorieId });
      await this.categorieProduitRepository.save(categorie);
    }

    // 🔹 Créer et sauvegarder le produit
    const produit = this.produitRepository.create({
      ...dto,
      images: imageFilename ? [imageFilename] : [], // 🔥 Stocke l'image si présente
      categorie: categorie, // ✅ Correction
 // 🔥 Stocke le nom de la catégorie
    });

    return this.produitRepository.save(produit);
  }
   // ✅ Ajoute cette méthode ici
   async updateStatut(id: number, isActive: boolean) {
    const produit = await this.produitRepository.findOneBy({ id });

    if (!produit) {
      throw new NotFoundException('Produit introuvable');
    }

    produit.isActive = isActive;

    return this.produitRepository.save(produit);
  }

}
