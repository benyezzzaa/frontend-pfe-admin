import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commande } from '../commande/commande.entity';
import { Produit } from '../produit/produit.entity';
import { User } from '../users/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Commande, Produit, User])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
