import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reclamation } from './reclamation.entity';
import { CreateReclamationDto } from './DTO/create-reclamation.dto';
import { Client } from '../client/client.entity';
import { User } from '../users/users.entity';

@Injectable()
export class ReclamationService {
  constructor(
    @InjectRepository(Reclamation)
    private repo: Repository<Reclamation>,
    @InjectRepository(Client)
    private clientRepo: Repository<Client>,
  ) {}

  async create(dto: CreateReclamationDto, user: User): Promise<Reclamation> {
    const client = await this.clientRepo.findOneBy({ id: dto.clientId });
    if (!client) throw new NotFoundException('Client non trouvé');

    const rec = this.repo.create({
      ...dto,
      user,
      client,
      status: 'ouverte',
    });

    return this.repo.save(rec);
  }

  findAll(): Promise<Reclamation[]> {
    return this.repo.find({ 
      relations: ['user', 'client'],
      order: { date: 'DESC' } 
    });
  }

  findByUser(userId: number): Promise<Reclamation[]> {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { date: 'DESC' },
    });
  }
async findOpenReclamations(): Promise<Reclamation[]> {
  return this.repo.find({
    where: { status: 'ouverte' },
    relations: ['user', 'client'],
    order: { date: 'DESC' },
  });
}
findOpen(): Promise<Reclamation[]> {
  return this.repo.find({
    where: { status: 'ouverte' },
    relations: ['client', 'user'],
    order: { date: 'DESC' },
  });
}
  async updateStatus(id: number, status: string): Promise<Reclamation> {
    const rec = await this.repo.findOne({
      where: { id },
      relations: ['user', 'client']
    });
    if (!rec) throw new NotFoundException('Réclamation introuvable');

    rec.status = status;
    return this.repo.save(rec);
  }
}
