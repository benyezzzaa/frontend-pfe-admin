import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './promotion.entity';
import { CreatePromotionDto } from './DTO/CreatePromotionDto.dto';
import { LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promoRepo: Repository<Promotion>,
    
  ) {}

  async create(dto: CreatePromotionDto): Promise<Promotion> {
    const promo = this.promoRepo.create({
      ...dto,
      isActive: true,
    });
    return await this.promoRepo.save(promo);
  }
async findActive(): Promise<Promotion[]> {
  const today = new Date();
  return this.promoRepo.find({
    where: {
      isActive: true,
      dateDebut: LessThanOrEqual(today),
      dateFin: MoreThanOrEqual(today),
    },
  });
}
async findActives(): Promise<Promotion[]> {
  return this.promoRepo.find({
    where: { isActive: true },
    order: { dateDebut: 'DESC' },
  });
}
  async findAll(): Promise<Promotion[]> {
  console.log('⏳ Appel à findAll()');
  const promos = await this.promoRepo.find();
  console.log('✅ Promotions trouvées :', promos);
  return promos;
}

  async update(id: number, dto: CreatePromotionDto): Promise<Promotion> {
    const promo = await this.promoRepo.findOneBy({ id });
    if (!promo) {
      throw new NotFoundException('Promotion introuvable');
    }
    Object.assign(promo, dto);
    return await this.promoRepo.save(promo);
  }
 async getPromotionsActives(): Promise<Promotion[]> {
    const now = new Date();
    return this.promoRepo.find({
      where: {
        isActive: true,
        dateDebut: LessThanOrEqual(now),
        dateFin: MoreThanOrEqual(now),
      },
      order: { dateDebut: 'DESC' },
    });
  }
  async toggleStatus(id: number): Promise<Promotion> {
    const promo = await this.promoRepo.findOneBy({ id });
    if (!promo) {
      throw new NotFoundException('Promotion introuvable');
    }
    promo.isActive = !promo.isActive;
    return await this.promoRepo.save(promo);
  }
}
