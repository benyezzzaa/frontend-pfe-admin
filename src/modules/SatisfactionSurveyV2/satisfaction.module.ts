import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SatisfactionSurvey } from './satisfaction-survey.entity';
import { SatisfactionResponse } from './satisfaction-response.entity';
import { SatisfactionService } from './satisfaction.service';
import { SatisfactionController } from './satisfaction.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SatisfactionSurvey, SatisfactionResponse])],
  providers: [SatisfactionService],
  controllers: [SatisfactionController],
})
export class SatisfactionModule {} 