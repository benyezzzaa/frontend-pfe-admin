import { Controller, Post, Get, Param, Body, Query, Res } from '@nestjs/common';
import { SatisfactionService } from './satisfaction.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { CreateResponseDto } from './dto/create-response.dto';
import { Response } from 'express';

@Controller('satisfaction')
export class SatisfactionController {
  constructor(private readonly satisfactionService: SatisfactionService) {}

  // Admin crée une enquête
  @Post('survey')
  createSurvey(@Body() dto: CreateSurveyDto) {
    return this.satisfactionService.createSurvey(dto);
  }

  // Commerciaux voient toutes les enquêtes
  @Get('surveys')
  getSurveys() {
    return this.satisfactionService.getSurveys();
  }

  // Détail d'une enquête (pour QR code)
  @Get('survey/:id')
  getSurvey(@Param('id') id: number) {
    return this.satisfactionService.getSurveyById(+id);
  }

  // Générer le QR code pour une enquête (admin)
  @Get('survey/:id/qrcode')
  async getSurveyQRCode(@Param('id') id: number, @Query('baseUrl') baseUrl: string) {
    // baseUrl doit être passé en query, ex: ?baseUrl=https://ton-domaine.com
    return {
      qrCode: await this.satisfactionService.generateSurveyQRCode(+id, baseUrl),
    };
  }

  // Télécharger le PDF de l'enquête (public)
  @Get('survey/:id/pdf')
  async getSurveyPdf(@Param('id') id: number, @Res() res: Response) {
    return this.satisfactionService.generateSurveyPdf(+id, res);
  }

  // Client soumet une réponse
  @Post('response')
  createResponse(@Body() dto: CreateResponseDto) {
    return this.satisfactionService.createResponse(dto);
  }
} 