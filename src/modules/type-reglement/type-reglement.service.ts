import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeReglement } from './typeReglement.entity';


@Injectable()
export class TypeReglementService {
  constructor(
    @InjectRepository(TypeReglement)
    private typeReglementRepository: Repository<TypeReglement>,
  ) {}

  async createTypeReglement(nom: string): Promise<TypeReglement> {
    const type = this.typeReglementRepository.create({ nom });
    return await this.typeReglementRepository.save(type);
  }

  async getAllTypes(): Promise<TypeReglement[]> {
    return await this.typeReglementRepository.find();
  }
}
