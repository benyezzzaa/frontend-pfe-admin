import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Survey } from './survey.entity';
import { SurveyQuestion } from './survey-question.entity';
import { SurveyAffectation } from './survey-affectation.entity';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateAffectationDto } from './dto/create-affectation.dto';
import { User } from '../users/users.entity';
import { Client } from '../client/client.entity';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private surveyRepo: Repository<Survey>,
    @InjectRepository(SurveyQuestion)
    private questionRepo: Repository<SurveyQuestion>,
    @InjectRepository(SurveyAffectation)
    private affectationRepo: Repository<SurveyAffectation>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Client)
    private clientRepo: Repository<Client>,
  ) {}

  async createSurvey(dto: CreateSurveyDto) {
    const survey = this.surveyRepo.create(dto);
    return this.surveyRepo.save(survey);
  }

  async updateSurvey(id: number, dto: Partial<CreateSurveyDto>) {
    const survey = await this.surveyRepo.findOne({ where: { id } });
    if (!survey) throw new Error('Enquête non trouvée');
    if (dto.nom !== undefined) survey.nom = dto.nom;
    if (dto.dateDebut !== undefined) survey.dateDebut = dto.dateDebut;
    if (dto.dateFin !== undefined) survey.dateFin = dto.dateFin;
    return this.surveyRepo.save(survey);
  }

  async addQuestion(surveyId: number, dto: CreateQuestionDto) {
    const survey = await this.surveyRepo.findOne({ where: { id: surveyId } });
    if (!survey) throw new NotFoundException('Enquête non trouvée');
    const question = this.questionRepo.create({ ...dto, survey });
    return this.questionRepo.save(question);
  }

  async addAffectation(surveyId: number, dto: CreateAffectationDto) {
    const survey = await this.surveyRepo.findOne({ where: { id: surveyId } });
    if (!survey) throw new NotFoundException('Enquête non trouvée');
    const commercial = await this.userRepo.findOne({ where: { id: dto.commercialId } });
    if (!commercial) throw new NotFoundException('Commercial non trouvé');
    const clients = await this.clientRepo.findByIds(dto.clientIds);
    const affectations = clients.map(client => this.affectationRepo.create({ survey, commercial, client }));
    return this.affectationRepo.save(affectations);
  }

  async getSurveys() {
    return this.surveyRepo.find();
  }

  async getSurveyQuestions(surveyId: number) {
    return this.questionRepo.find({ where: { survey: { id: surveyId } } });
  }

  async getSurveyAffectations(surveyId: number) {
    return this.affectationRepo.find({ where: { survey: { id: surveyId } }, relations: ['commercial', 'client'] });
  }
  async getEnquetesAffecteesCommercial(commercialId: number) {
    const affectations = await this.affectationRepo.find({
      where: { commercial: { id: commercialId } },
      relations: ['survey', 'survey.questions', 'client'],
    });

    // Regroupe les clients par enquête
    const surveyMap = new Map();
    for (const aff of affectations) {
      const surveyId = aff.survey.id;
      if (!surveyMap.has(surveyId)) {
        surveyMap.set(surveyId, {
          ...aff.survey,
          clients: [],
        });
      }
      surveyMap.get(surveyId).clients.push(aff.client);
    }
    return Array.from(surveyMap.values());
  }

  async generateSurveyPdf(surveyId: number, res: Response) {
    const survey = await this.surveyRepo.findOne({
      where: { id: surveyId },
      relations: ['questions'],
    });
    if (!survey) throw new NotFoundException('Enquête non trouvée');

    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    // En-tête PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=enquete_${surveyId}.pdf`);
    doc.pipe(res);

    // Titre
    doc.moveDown(1.5);
    doc.fontSize(22).fillColor('#3F51B5').text(survey.nom, { align: 'center', underline: true });
    doc.moveDown(0.5);

    // Dates
    doc.fontSize(13).fillColor('black').text(`Du ${survey.dateDebut} au ${survey.dateFin}`, { align: 'center' });
    doc.moveDown(1.5);

    // Questions
    doc.fontSize(16).fillColor('#222').text('Questions :', { underline: true });
    doc.moveDown(0.5);

    if (survey.questions && survey.questions.length > 0) {
      survey.questions.forEach((q, i) => {
        let typeLabel = '';
        let color = '#888';
        switch (q.type) {
          case 'text':
            typeLabel = 'Texte libre';
            color = '#1976D2';
            break;
          case 'image':
            typeLabel = 'Image';
            color = '#388E3C';
            break;
          case 'select':
            typeLabel = 'Oui / Non';
            color = '#F57C00';
            break;
          default:
            typeLabel = q.type;
        }
        doc
          .moveDown(0.5)
          .fontSize(13)
          .fillColor('black')
          .text(`${i + 1}. ${q.text}`)
          .moveDown(0.1)
          .fontSize(11)
          .fillColor(color)
          .text(`Type de réponse : ${typeLabel}`, { indent: 20 });
        doc.moveDown(0.2);
        // Ligne pour la réponse (pour impression papier)
        if (q.type === 'text') {
          doc.fillColor('#aaa').text('Réponse : ___________________________________________', { indent: 20 });
        } else if (q.type === 'select') {
          doc.fillColor('#aaa').text('Réponse : Oui   /   Non', { indent: 20 });
        } else if (q.type === 'image') {
          doc.fillColor('#aaa').text('Réponse : [Espace pour coller ou dessiner une image]', { indent: 20 });
        }
      });
    } else {
      doc.moveDown().fontSize(12).fillColor('red').text('Aucune question pour cette enquête.');
    }

    // Pied de page
    doc.moveDown(2);
    doc.fontSize(10).fillColor('#888').text('Généré par Digital Process - Force de Vente', { align: 'center' });

    doc.end();
  }
}