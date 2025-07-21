import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategorieClient } from './categorie-client.entity';
import { CreateCategorieClientDto } from './DTO/create-categorie-client.dto';

@Injectable()
export class CategorieClientService {
  constructor(
    @InjectRepository(CategorieClient)
    private readonly categorieRepo: Repository<CategorieClient>,
  ) {}

  async create(dto: CreateCategorieClientDto): Promise<CategorieClient> {
    const exists = await this.categorieRepo.findOneBy({ nom: dto.nom });
    if (exists) {
      throw new ConflictException('Cette catégorie existe déjà');
    }

    const newCategorie = this.categorieRepo.create(dto);
    return this.categorieRepo.save(newCategorie);
  }

  async findAll(): Promise<CategorieClient[]> {
    return this.categorieRepo.find();
  }

  async update(id: number, dto: CreateCategorieClientDto) {
    const cat = await this.categorieRepo.findOneBy({ id });
    if (!cat) throw new Error('Catégorie non trouvée');
    cat.nom = dto.nom;
    return this.categorieRepo.save(cat);
  }

  async updateStatus(id: number, isActive: boolean) {
    try {
      const cat = await this.categorieRepo.findOneBy({ id });
      if (!cat) throw new Error('Catégorie non trouvée');
      cat.isActive = isActive;
      return this.categorieRepo.save(cat);
    } catch (e) {
      console.error('Erreur updateStatus:', e);
      throw e;
    }
  }
}
