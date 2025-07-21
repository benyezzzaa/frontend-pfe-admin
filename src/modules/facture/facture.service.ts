import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Facture } from './facture.entity';

@Injectable()
export class FactureService {
  constructor(
    @InjectRepository(Facture)
    private readonly factureRepository: Repository<Facture>,
  ) {}

  async findAll(): Promise<Facture[]> {
    return await this.factureRepository.find();
  }

  async findById(id: number): Promise<Facture | null> {  // <-- CORRIGÉ ici
    return await this.factureRepository.findOneBy({ id });
  }

  async create(factureData: Partial<Facture>): Promise<Facture> {
    const newFacture = this.factureRepository.create(factureData);
    return await this.factureRepository.save(newFacture);
  }

  async delete(id: number): Promise<void> {
    await this.factureRepository.delete(id);
  }
}
