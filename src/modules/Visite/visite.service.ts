import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visite } from './visite.entity';
import { CreateVisiteDto } from './dto/create-visite.dto';
import { User } from '../users/users.entity';
import { Client } from '../client/client.entity';
import { RaisonVisite } from '../raison-visite/raison-visite.entity';

@Injectable()
export class VisiteService {
  constructor(
    @InjectRepository(Visite)
    private visiteRepository: Repository<Visite>,

    @InjectRepository(Client)
    private clientRepository: Repository<Client>, // ✅ injecté ici
      @InjectRepository(RaisonVisite)
    private raisonVisiteRepository: Repository<RaisonVisite>,
  ) {}

async createVisite(dto: CreateVisiteDto, user: User): Promise<Visite> {
  const client = await this.clientRepository.findOneBy({ id: dto.clientId });
  if (!client) throw new NotFoundException('Client non trouvé.');

  const raison = await this.raisonVisiteRepository.findOneBy({ id: dto.raisonId });
  if (!raison) throw new NotFoundException('Raison de visite non trouvée.');

  if (!dto.date) {
    throw new BadRequestException('Date manquante.');
  }

  const date = new Date(dto.date);
  if (isNaN(date.getTime())) {
    throw new BadRequestException('Format de date invalide.');
  }

  const onlyDate = date.toISOString().split('T')[0]; // "YYYY-MM-DD"

  const existingVisite = await this.visiteRepository
    .createQueryBuilder('visite')
    .where('visite.userId = :userId', { userId: user.id })
    .andWhere('visite.client_id = :clientId', { clientId: dto.clientId })
    .andWhere("DATE(visite.date) = :date", { date: onlyDate })
    .getOne();

  if (existingVisite) {
    throw new ForbiddenException("Une visite pour ce client existe déjà à cette date.");
  }

  const newVisite = this.visiteRepository.create({
    date,
    user,
    client,
    raison,
  });

  return await this.visiteRepository.save(newVisite);
}



   // 👇 Cette méthode correspond à GET /visites/all
   async getAllVisites(): Promise<Visite[]> {
    return this.visiteRepository.find({
      relations: ['user', 'client', 'raison'], // assure-toi que raison est bien défini dans l'entité
      order: { id: 'ASC' },
    });
  }

  async getVisitesByCommercial(commercialId: number): Promise<Visite[]> {
    return await this.visiteRepository.find({
      where: { user: { id: commercialId } },
      relations: ['user', 'client'],
    });
  }

  async deleteVisite(id: number, user: User): Promise<void> {
    const visite = await this.visiteRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!visite) throw new NotFoundException('Visite non trouvée.');

    if (user.role !== 'admin' && visite.user.id !== user.id) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres visites.');
    }

    await this.visiteRepository.remove(visite);
  }
}
