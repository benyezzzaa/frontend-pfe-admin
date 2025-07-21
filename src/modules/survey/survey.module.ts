import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Survey } from './survey.entity';
import { SurveyQuestion } from './survey-question.entity';
import { SurveyAffectation } from './survey-affectation.entity';
import { SurveyService } from './survey.service';
import { SurveyController } from './survey.controller';
import { User } from '../users/users.entity';
import { Client } from '../client/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Survey, SurveyQuestion, SurveyAffectation, User, Client])],
  providers: [SurveyService],
  controllers: [SurveyController],
})
export class SurveyModule {} 