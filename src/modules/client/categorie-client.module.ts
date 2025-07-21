import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategorieClient } from './categorie-client.entity';
import { CategorieClientService } from './categorie-client.service';
import { CategorieClientController } from './categorie-client.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CategorieClient])],
  providers: [CategorieClientService],
  controllers: [CategorieClientController],
  exports: [CategorieClientService, TypeOrmModule],
})
export class CategorieClientModule {}
