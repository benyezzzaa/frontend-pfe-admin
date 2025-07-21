import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reclamation } from './reclamation.entity';
import { ReclamationController } from './reclamation.controller';
import { ReclamationService } from './reclamation.service';
import { Client } from '../client/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reclamation, Client])],
  controllers: [ReclamationController],
  providers: [ReclamationService],
})
export class ReclamationModule {}
