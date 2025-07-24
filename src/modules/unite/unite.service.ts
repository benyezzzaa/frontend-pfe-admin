import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unite } from './unite.entity';
import { CreateUniteDto } from './dto/CreateUniteDto';

@Injectable()
export class UniteService {
  constructor(
    @InjectRepository(Unite)
    private uniteRepository: Repository<Unite>,
  ) {}

  async create(dto: CreateUniteDto): Promise<Unite> {
    // Vérifie l'existence insensible à la casse
    const exist = await this.uniteRepository
      .createQueryBuilder('u')
      .where('LOWER(u.nom) = LOWER(:nom)', { nom: dto.nom.trim() })
      .getOne();
    if (exist) {
      throw new NotFoundException("Cette unité existe déjà (insensible à la casse)");
    }
    const unite = this.uniteRepository.create({
      ...dto,
      isActive: true,
    });
    return await this.uniteRepository.save(unite);
  }

  async findAll(options?: { search?: string; page?: number; limit?: number }): Promise<{ data: Unite[]; total: number; page: number; limit: number }> {
    let query = this.uniteRepository.createQueryBuilder('u');
    if (options?.search) {
      query = query.where('LOWER(u.nom) LIKE :search', { search: `%${options.search.toLowerCase()}%` });
    }
    const page = options?.page && options.page > 0 ? options.page : 1;
    const limit = options?.limit && options.limit > 0 ? options.limit : 10;
    query = query.skip((page - 1) * limit).take(limit);
    const [data, total] = await query.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Unite> {
    const unite = await this.uniteRepository.findOne({ where: { id } });
    if (!unite) {
      throw new NotFoundException(`Unité avec l'ID ${id} non trouvée`);
    }
    return unite;
  }

async update(id: number, dto: CreateUniteDto): Promise<Unite> {
  const unite = await this.findOne(id);

  // Vérifie s’il existe déjà une unité avec le même nom (autre que celle qu’on modifie)
  const existing = await this.uniteRepository
    .createQueryBuilder('u')
    .where('LOWER(u.nom) = LOWER(:nom)', { nom: dto.nom.trim() })
    .andWhere('u.id != :id', { id })
    .getOne();

  if (existing) {
    throw new BadRequestException(`Une autre unité avec le nom "${dto.nom}" existe déjà.`);
  }

  Object.assign(unite, dto);
 
  try {
    return await this.uniteRepository.save(unite);
   } catch (error) {
     throw new Error("Erreur lors de la mise à jour de l'unité");
  }
}
async toggleStatus(id: number, isActive: boolean): Promise<Unite> {
  const unite = await this.findOne(id);
  unite.isActive = isActive;
  return this.uniteRepository.save(unite);
}
  async delete(id: number): Promise<void> {
    const unite = await this.findOne(id);
    await this.uniteRepository.remove(unite);
  }
}
