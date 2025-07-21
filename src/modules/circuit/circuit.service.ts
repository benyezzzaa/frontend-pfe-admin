// 📁 src/circuit/circuit.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Circuit } from './circuit.entity';
import { CreateCircuitDto } from './DTO/create-circuit.dto';
import { User } from '../users/users.entity';
import { Client } from '../client/client.entity';

@Injectable()
export class CircuitService {
  constructor(
    @InjectRepository(Circuit)
    private readonly circuitRepo: Repository<Circuit>,
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
  ) {}
async getTodayCircuit(user: User): Promise<Circuit | null> {
  const dateStr = new Date().toISOString().split('T')[0];
  return this.getCircuitByDate(user, dateStr);
}
 async create(dto: CreateCircuitDto, user: User): Promise<Circuit> {
  if (!dto.clientIds || dto.clientIds.length === 0) {
    throw new NotFoundException('Aucun client sélectionné pour le circuit');
  }

  const existing = await this.getCircuitByDate(user, dto.date);
  if (existing) {
    throw new NotFoundException('Un circuit existe déjà pour cette date');
  }

  const clients = await this.clientRepo.findBy({ id: In(dto.clientIds) });

  // ✅ Ne garder que les clients avec GPS
  const clientsWithGPS = clients.filter(c => c.latitude != null && c.longitude != null);

  if (clientsWithGPS.length === 0) {
    throw new NotFoundException('Aucun client valide avec position GPS');
  }

  const circuit = this.circuitRepo.create({
    date: new Date(dto.date),
    clients: clientsWithGPS,
    commercial: user,
  });

  return this.circuitRepo.save(circuit);
}

async findAll(): Promise<Circuit[]> {
    return this.circuitRepo.find({
      relations: ['clients'], // si besoin
    });
  }

  async getCircuitByDate(user: User, date: string): Promise<Circuit | null> {
    return this.circuitRepo.findOne({
      where: {
        commercial: { id: user.id },
        date: new Date(date),
      },
    });
  }
}
