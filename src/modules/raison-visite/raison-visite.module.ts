import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RaisonVisite } from './raison-visite.entity';
import { RaisonVisiteService } from './raison-visite.service';
import { RaisonVisiteController } from './raison-visite.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RaisonVisite])],
  controllers: [RaisonVisiteController],
  providers: [RaisonVisiteService],
})
export class RaisonVisiteModule {}
