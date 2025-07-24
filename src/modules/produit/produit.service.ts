import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produit } from './produit.entity';
import { CreateProduitDto } from './dto/create-produit.dto';
import { CategorieProduit } from '../categorie-produit/categorie-produit.entity';
import { Unite } from '../unite/unite.entity';
import { UpdateStatutDto } from './dto/update-statut.dto';
import { UpdateProduitDto } from './dto/update-produit.dto';

@Injectable()
export class ProduitService {
  constructor(
    @InjectRepository(Produit)
    private produitRepository: Repository<Produit>,

    @InjectRepository(CategorieProduit)
    private categorieProduitRepository: Repository<CategorieProduit>,

    @InjectRepository(Unite)
    private uniteRepository: Repository<Unite>,
  ) {}

  async createProduit(dto: CreateProduitDto, imageFilenames?: string[]) {
    
    if (!dto.uniteId || !dto.categorieId) {
      throw new BadRequestException(
        'Les champs uniteId et categorieId sont requis.',
      );
    }

    const unite = await this.uniteRepository
      .createQueryBuilder('unite')
      .where(' id  =  :id ', { id: dto.uniteId })
      .getOne();

    if (!unite) {
      throw new NotFoundException(`Unité "${dto.uniteId}" non trouvée.`);
    }

    const categorie = await this.categorieProduitRepository.findOneBy({
      nom: dto.categorieId,
    });

    if (!categorie) {
      throw new NotFoundException(`Catégorie "${dto.categorieId}" non trouvée.`);
    }

    const produit = this.produitRepository.create({
      nom: dto.nom,
      description: dto.description,
      prix_unitaire: dto.prix_unitaire,
      prix_unitaire_ttc: Number((dto.prix_unitaire * (1 + dto.tva / 100)).toFixed(2)),
      tva: dto.tva,
      colisage: dto.colisage,
      images: imageFilenames ?? [],
      uniteId: unite.id,
      categorieId: categorie.id,
    });

    return this.produitRepository.save(produit);
  }

  async getAllProduits() {
    return this.produitRepository.find({
      relations: ['categorie', 'unite'],
    });
  }

 async updateProduit(id: number, dto: UpdateProduitDto, imageFilenames?: string[]) {
  const produit = await this.produitRepository.findOneBy({ id });

  if (!produit) {
    throw new NotFoundException('Produit introuvable');
  }

  produit.nom = dto.nom ?? produit.nom;
  produit.description = dto.description ?? produit.description;
  produit.prix_unitaire = dto.prix_unitaire ?? produit.prix_unitaire;
  produit.tva = dto.tva ?? produit.tva;
  produit.colisage = dto.colisage ?? produit.colisage;

  produit.prix_unitaire_ttc = Number(
    ((produit.prix_unitaire) * (1 + produit.tva / 100)).toFixed(2)
  );

 

 if (dto.categorieId) {
  produit.categorie = { id: Number(dto.categorieId) } as CategorieProduit;
}

produit.unite = { id: dto.uniteId } as Unite;


  if (imageFilenames && imageFilenames.length > 0) {
    produit.images = imageFilenames;
  }
 

  return this.produitRepository.save(produit);
}

  async updateStatut(id: number, isActive: boolean) {
    const produit = await this.produitRepository.findOneBy({ id });

    if (!produit) {
      throw new NotFoundException('Produit introuvable');
    }

    await this.produitRepository
      .createQueryBuilder()
      .update(Produit)
      .set({ isActive })
      .where('id = :id', { id })
      .execute();

    return {
      message: `Produit ${isActive ? 'activé' : 'désactivé'} ✅`,
    };
  }

  // Méthode pour créer des produits de test
  async createTestProducts() {
    const testProducts = [
      {
        nom: 'Lait Bio 1L',
        description: 'Lait bio frais de vache',
        prix_unitaire: 1.20,
        tva: 5.5,
        colisage: 12,
        uniteId: 66,
        categorieId: 'Bio'
      },
      
    ];

    const createdProducts: Produit[] = [];
    for (const product of testProducts) {
      try {
        const created = await this.createProduit(product) ;
        createdProducts.push(created);
      } catch (error) {
        console.log(`Erreur lors de la création du produit ${product.nom}:`, error.message);
      }
    }

    return createdProducts;
  }
}
