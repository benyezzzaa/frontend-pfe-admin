// ✅ categorie-produit.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategorieProduit } from './categorie-produit.entity';
import { CreateCategorieDto } from './dto/create-categorie.dto';

@Injectable()
export class CategorieProduitService {
  constructor(
    @InjectRepository(CategorieProduit)
    private readonly categorieRepository: Repository<CategorieProduit>
  ) {}

  async create(dto: CreateCategorieDto): Promise<CategorieProduit> {
    // Vérifie l'existence insensible à la casse
    const exist = await this.categorieRepository
      .createQueryBuilder('cat')
      .where('LOWER(cat.nom) = LOWER(:nom)', { nom: dto.nom.trim() })
      .getOne();
    if (exist) {
      throw new NotFoundException('Cette catégorie existe déjà (insensible à la casse)');
    }
    const cat = this.categorieRepository.create(dto);
    return this.categorieRepository.save(cat);
  }

  async getAll(): Promise<CategorieProduit[]> {
    return this.categorieRepository.find();
  }

  async getById(id: number): Promise<CategorieProduit> {
    const cat = await this.categorieRepository.findOneBy({ id });
    if (!cat) throw new NotFoundException('Catégorie introuvable');
    return cat;
  }

  async update(id: number, dto: Partial<CreateCategorieDto>): Promise<CategorieProduit> {
    const cat = await this.getById(id);
    Object.assign(cat, dto);
    return this.categorieRepository.save(cat);
  }

  async delete(id: number): Promise<void> {
    const result = await this.categorieRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Catégorie introuvable');
  }
  
}