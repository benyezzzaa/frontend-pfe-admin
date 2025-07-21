import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReglementFacture } from './reglement-facture.entity';
import { ReglementFactureService } from './reglement-facture.service';
import { ReglementFactureController } from './reglement-facture.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReglementFacture])],
  providers: [ReglementFactureService],
  controllers: [ReglementFactureController],
  exports: [ReglementFactureService], // 👈 Très important !
})
export class ReglementFactureModule {}
