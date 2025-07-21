import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Facture } from './facture.entity';
import { FactureService } from './facture.service';      // 🔥 Bon chemin
import { FactureController } from './facture.controller'; // 🔥 Bon chemin
import { ReglementFactureModule } from '../reglement-facture/reglement-facture.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Facture]),
    forwardRef(() => ReglementFactureModule), // ✅ Pour résoudre la dépendance circulaire
  ],
  controllers: [FactureController],  // ✅ Attention à la majuscule
  providers: [FactureService],       // ✅ Attention à la majuscule
  exports: [FactureService],         // ✅ Exporte pour pouvoir l'utiliser ailleurs
})
export class FactureModule {}
