import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commercial } from './commercial.entity';
import { CommercialService } from './commercial.service';
import { CommercialController } from './commercial.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Commercial])],
  controllers: [CommercialController],
  providers: [CommercialService],
})
export class CommercialModule {}
