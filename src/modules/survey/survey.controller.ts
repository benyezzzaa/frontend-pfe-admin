import { Controller, Post, Body, Param, Get, Put, Query } from '@nestjs/common';
import { SurveyService } from './survey.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateAffectationDto } from './dto/create-affectation.dto';

@Controller('enquetes')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Post()
  createSurvey(@Body() dto: CreateSurveyDto) {
    return this.surveyService.createSurvey(dto);
  }

  @Post(':id/questions')
  addQuestion(@Param('id') id: string, @Body() dto: CreateQuestionDto) {
    return this.surveyService.addQuestion(Number(id), dto);
  }

  @Post(':id/affectation')
  addAffectation(@Param('id') id: string, @Body() dto: CreateAffectationDto) {
    return this.surveyService.addAffectation(Number(id), dto);
  }

  @Put(':id')
  updateSurvey(@Param('id') id: string, @Body() dto: Partial<CreateSurveyDto>) {
    return this.surveyService.updateSurvey(Number(id), dto);
  }

  @Get()
  getSurveys() {
    return this.surveyService.getSurveys();
  }

  @Get(':id/questions')
  getSurveyQuestions(@Param('id') id: string) {
    return this.surveyService.getSurveyQuestions(Number(id));
  }

  @Get(':id/affectations')
  getSurveyAffectations(@Param('id') id: string) {
    return this.surveyService.getSurveyAffectations(Number(id));
  }

  @Get('affectees')
  getAffectees(@Query('commercialId') commercialId: number) {
    return this.surveyService.getEnquetesAffecteesCommercial(commercialId);
  }
} 