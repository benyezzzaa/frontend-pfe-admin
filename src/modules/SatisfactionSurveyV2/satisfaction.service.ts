import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SatisfactionSurvey } from './satisfaction-survey.entity';
import { SatisfactionResponse } from './satisfaction-response.entity';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { CreateResponseDto } from './dto/create-response.dto';
import * as QRCode from 'qrcode';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';

@Injectable()
export class SatisfactionService {
  constructor(
    @InjectRepository(SatisfactionSurvey)
    private surveyRepo: Repository<SatisfactionSurvey>,
    @InjectRepository(SatisfactionResponse)
    private responseRepo: Repository<SatisfactionResponse>,
  ) {}

  async createSurvey(dto: CreateSurveyDto) {
    const survey = this.surveyRepo.create(dto);
    return this.surveyRepo.save(survey);
  }

  async getSurveys() {
    return this.surveyRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getSurveyById(id: number) {
    const survey = await this.surveyRepo.findOne({ where: { id } });
    if (!survey) throw new NotFoundException('Enquête non trouvée');
    return survey;
  }

  async generateSurveyQRCode(surveyId: number, baseUrl: string) {
    const url = `${baseUrl}/satisfaction/survey/${surveyId}/pdf`;
    return QRCode.toDataURL(url); // image base64
  }

  async generateSurveyPdf(surveyId: number, res: Response) {
    const survey = await this.surveyRepo.findOne({ where: { id: surveyId } });
    if (!survey) throw new NotFoundException('Enquête non trouvée');

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=enquete_${surveyId}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text(survey.titre, { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(survey.description || '', { align: 'left' });
    doc.moveDown();
    doc.text('Nom du client: __________________________');
    doc.moveDown();
    doc.text('Réponse:');
    doc.moveDown();
    doc.text('__________________________________________');
    doc.text('__________________________________________');
    doc.text('__________________________________________');
    doc.moveDown();
    doc.text('Merci de renvoyer ce PDF rempli à : admin@tondomaine.com', { align: 'left' });

    doc.end();
  }

  async createResponse(dto: CreateResponseDto) {
    const survey = await this.surveyRepo.findOne({ where: { id: dto.surveyId } });
    if (!survey) throw new NotFoundException('Enquête non trouvée');
    const response = this.responseRepo.create({
      survey,
      nomClient: dto.nomClient,
      reponse: dto.reponse,
    });
    return this.responseRepo.save(response);
  }
} 