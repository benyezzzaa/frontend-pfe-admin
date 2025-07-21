import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReglementService } from './reglement.service';
import { ReglementController } from './reglement.controller';
import { Reglement } from './reglement.entity';
import { Facture } from '../facture/facture.entity';
import { TypeReglement } from '../type-reglement/typeReglement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reglement, Facture, TypeReglement])], // ✅ Ajout des entités ici
  providers: [ReglementService],
  controllers: [ReglementController],
  exports: [ReglementService], // ✅ Si utilisé ailleurs, il faut l'exporter
})
export class ReglementModule {}
