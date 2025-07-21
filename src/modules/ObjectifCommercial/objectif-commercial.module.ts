import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObjectifCommercial } from './objectif-commercial.entity';
import { ObjectifCommercialService } from './objectif-commercial.service';
import { ObjectifCommercialController } from './objectif-commercial.controller';
import { User } from '../users/users.entity'; // pour la relation avec les commerciaux
import { Commande } from '../commande/commande.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ObjectifCommercial, User, Commande])],
  providers: [ObjectifCommercialService],
  controllers: [ObjectifCommercialController],
})
export class ObjectifCommercialModule {}
