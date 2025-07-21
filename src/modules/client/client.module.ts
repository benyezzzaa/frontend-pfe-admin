import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './client.entity';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { Visite } from '../Visite/visite.entity';
import { CategorieClient } from './categorie-client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Client, Visite, CategorieClient])],
  controllers: [ClientController],
  providers: [ClientService],
  exports: [
    ClientService,
    TypeOrmModule, // ✅ Ceci exporte aussi les repositories
  ],
})
export class ClientModule {}