import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RaisonVisite } from './raison-visite.entity';


@Injectable()
export class RaisonVisiteService {
  constructor(
    @InjectRepository(RaisonVisite)
    private readonly raisonRepo: Repository<RaisonVisite>,
  ) {}

  findAll(): Promise<RaisonVisite[]> {
    return this.raisonRepo.find();
  }

  async create(nom: string): Promise<RaisonVisite> {
    const raison = this.raisonRepo.create({ nom });
    return this.raisonRepo.save(raison);
  }
findActive(): Promise<RaisonVisite[]> {
  return this.raisonRepo.find({ where: { isActive: true } });
}
  async update(id: number, nom: string): Promise<RaisonVisite> {
    const raison = await this.raisonRepo.findOneBy({ id });
    if (!raison) throw new NotFoundException('Raison introuvable');
    raison.nom = nom;
    return this.raisonRepo.save(raison);
  }

async toggleActive(id: number): Promise<RaisonVisite> {
  const raison = await this.raisonRepo.findOneBy({ id });
  if (!raison) throw new NotFoundException('Raison introuvable');

  raison.isActive = !raison.isActive; // ⬅️ toggle dynamique ici
  return this.raisonRepo.save(raison);
}

}
