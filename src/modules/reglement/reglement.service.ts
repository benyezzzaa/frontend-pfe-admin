// src/modules/reglement/reglement.service.ts

import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reglement } from './reglement.entity';
import { CreateReglementDto } from './dto/create-reglement.dto';
import { TypeReglement } from '../type-reglement/typeReglement.entity';

@Injectable()
export class ReglementService {
  constructor(
    @InjectRepository(Reglement)
    private readonly reglementRepository: Repository<Reglement>,

    @InjectRepository(TypeReglement)
    private readonly typeReglementRepository: Repository<TypeReglement>,
  ) {}

  async create(dto: CreateReglementDto): Promise<Reglement> {
    const reglement = new Reglement();
    reglement.mode_paiement = dto.mode_paiement;
    reglement.montant = dto.montant;
    reglement.montantPaye = dto.montantPaye;
    reglement.datePaiement = new Date(dto.datePaiement);
    reglement.statut = dto.statut;

    if (dto.typeReglementId) {
      const typeReglement = await this.typeReglementRepository.findOne({
        where: { id: dto.typeReglementId },
      });

      if (!typeReglement) {
        throw new NotFoundException('Type de règlement non trouvé');
      }

      reglement.typeReglement = typeReglement;
    }

    return await this.reglementRepository.save(reglement);
  }

  async findAll(): Promise<Reglement[]> {
    return this.reglementRepository.find({
      relations: ['typeReglement', 'reglementsFactures'],
    });
  }
}
