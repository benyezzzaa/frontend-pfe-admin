import { Module } from '@nestjs/common';
import { UniteService } from './unite.service';
import { UniteController } from './unite.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Unite } from './unite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Unite])],
  controllers: [UniteController],
  providers: [UniteService],
})
export class UniteModule {}
