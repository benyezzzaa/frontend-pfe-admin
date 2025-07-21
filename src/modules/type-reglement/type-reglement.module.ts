import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeReglement } from './typeReglement.entity';
import { TypeReglementService } from './type-reglement.service';
import { TypeReglementController } from './type-reglement.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TypeReglement])],
  controllers: [TypeReglementController],
  providers: [TypeReglementService],
  exports: [TypeReglementService],
})
export class TypeReglementModule {}
