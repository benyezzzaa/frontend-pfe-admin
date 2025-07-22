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
    res.setHeader('Content-Disposition', `attachment; filename=enquete_${surveyId}_${survey.nom.replace(/\s+/g, '_')}.pdf`);
    doc.pipe(res);

    // ===== EN-TÊTE PROFESSIONNEL =====
    
    // Logo/En-tête de l'entreprise
    doc.rect(40, 40, 515, 80).stroke('#3F51B5');
    doc.fillColor('#3F51B5').fill();
    doc.rect(40, 40, 515, 80).stroke('#3F51B5');
    
    // Titre principal
    doc.fillColor('white')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('DIGITAL PROCESS', 50, 55, { align: 'center', width: 495 });
    
    // Sous-titre
    doc.fontSize(14)
       .font('Helvetica')
       .text('Force de Vente - Enquête de Satisfaction', 50, 85, { align: 'center', width: 495 });
    
    // Informations de contact
    doc.fontSize(10)
       .text('📧 contact@digitalprocess.com | 📞 +216 XX XXX XXX | 🌐 www.digitalprocess.com', 50, 105, { align: 'center', width: 495 });
    
    // ===== INFORMATIONS DE L'ENQUÊTE =====
    doc.moveDown(3);
    
    // Titre de l'enquête
    doc.fillColor('#2E3440')
       .fontSize(20)
       .font('Helvetica-Bold')
       .text(survey.nom, { align: 'center', underline: true });
    
    doc.moveDown(0.5);
    
    // Période de l'enquête
    doc.fillColor('#5E81AC')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('📅 Période de l\'enquête :', 50, doc.y);
    
    doc.fillColor('#4C566A')
       .fontSize(12)
       .font('Helvetica')
       .text(`Du ${new Date(survey.dateDebut).toLocaleDateString('fr-FR')} au ${new Date(survey.dateFin).toLocaleDateString('fr-FR')}`, 50, doc.y + 5);
    
    doc.moveDown(1);
    
    // ===== INFORMATIONS GÉNÉRALES =====
    doc.fillColor('#5E81AC')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('📋 Informations générales :', 50, doc.y);
    
    doc.fillColor('#4C566A')
       .fontSize(11)
       .font('Helvetica')
       .text(`• Enquête créée le : ${new Date(survey.createdAt).toLocaleDateString('fr-FR')}`, 60, doc.y + 5);
    doc.text(`• Nombre de questions : ${survey.questions?.length || 0}`, 60, doc.y + 3);
    doc.text(`• Statut : En cours`, 60, doc.y + 3);
    
    doc.moveDown(1);
    
    // Ligne de séparation
    doc.moveTo(50, doc.y)
       .lineTo(545, doc.y)
       .stroke('#3F51B5');
    
    doc.moveDown(1);

    // ===== SECTION DES QUESTIONS =====
    doc.fillColor('#2E3440')
       .fontSize(18)
       .font('Helvetica-Bold')
       .text('📝 Questions de l\'enquête', { underline: true });
    
    doc.moveDown(0.5);

    if (survey.questions && survey.questions.length > 0) {
      survey.questions.forEach((q, i) => {
        // Définir les couleurs et labels selon le type
        let typeLabel = '';
        let color = '#5E81AC';
        let icon = '❓';
        
        switch (q.type) {
          case 'text':
            typeLabel = 'Réponse libre';
            color = '#88C0D0';
            icon = '✏️';
            break;
          case 'image':
            typeLabel = 'Réponse avec image';
            color = '#A3BE8C';
            icon = '🖼️';
            break;
          case 'select':
            typeLabel = 'Oui / Non';
            color = '#EBCB8B';
            icon = '✅';
            break;
          default:
            typeLabel = q.type;
            icon = '❓';
        }
        
        // Numéro et question
        doc.fillColor('#2E3440')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text(`Question ${i + 1}`, 50, doc.y);
        
        doc.fillColor('#4C566A')
           .fontSize(12)
           .font('Helvetica')
           .text(q.text, 50, doc.y + 5, { width: 495, align: 'justify' });
        
        doc.moveDown(0.3);
        
        // Type de réponse avec icône
        doc.fillColor(color)
           .fontSize(10)
           .font('Helvetica-Bold')
           .text(`${icon} Type de réponse : ${typeLabel}`, 60, doc.y);
        
        doc.moveDown(0.5);
        
        // Espace pour la réponse
        doc.rect(60, doc.y, 435, 30).stroke('#D8DEE9');
        doc.fillColor('#ECEFF4')
           .fontSize(10)
           .font('Helvetica')
           .text('Espace pour votre réponse...', 65, doc.y + 10);
        
        // Lignes pour la réponse selon le type
        if (q.type === 'text') {
          doc.fillColor('#D8DEE9')
             .moveTo(65, doc.y + 15)
             .lineTo(485, doc.y + 15)
             .stroke();
          doc.fillColor('#D8DEE9')
             .moveTo(65, doc.y + 20)
             .lineTo(485, doc.y + 20)
             .stroke();
        } else if (q.type === 'select') {
          doc.fillColor('#4C566A')
             .fontSize(10)
             .font('Helvetica')
             .text('☐ Oui    ☐ Non', 65, doc.y + 10);
        } else if (q.type === 'image') {
          doc.fillColor('#4C566A')
             .fontSize(10)
             .font('Helvetica')
             .text('[Espace pour coller ou dessiner une image]', 65, doc.y + 10);
        }
        
        doc.moveDown(1.5);
      });
    } else {
      doc.fillColor('#BF616A')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('⚠️ Aucune question définie pour cette enquête.', { align: 'center' });
    }

    // ===== PIED DE PAGE PROFESSIONNEL =====
    doc.moveDown(2);
    
    // Ligne de séparation
    doc.moveTo(50, doc.y)
       .lineTo(545, doc.y)
       .stroke('#3F51B5');
    
    doc.moveDown(0.5);
    
    // Informations de retour
    doc.fillColor('#5E81AC')
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('📤 Retour de l\'enquête :', 50, doc.y);
    
    doc.fillColor('#4C566A')
       .fontSize(10)
       .font('Helvetica')
       .text('• Par email : contact@digitalprocess.com', 60, doc.y + 5);
    doc.text('• Par téléphone : +216 XX XXX XXX', 60, doc.y + 3);
    doc.text('• Date limite de retour : ' + new Date(survey.dateFin).toLocaleDateString('fr-FR'), 60, doc.y + 3);
    
    doc.moveDown(1);
    
    // Note de confidentialité
    doc.fillColor('#8FBCBB')
       .fontSize(9)
       .font('Helvetica')
       .text('🔒 Vos réponses sont confidentielles et seront utilisées uniquement pour améliorer nos services.', 50, doc.y, { width: 495, align: 'center' });
    
    doc.moveDown(0.5);
    
    // Signature et date
    doc.fillColor('#4C566A')
       .fontSize(10)
       .font('Helvetica')
       .text('Signature du client : _________________________', 50, doc.y);
    doc.text('Date : _________________________', 300, doc.y);
    
    doc.moveDown(1);
    
    // Pied de page final
    doc.fillColor('#3F51B5')
       .fontSize(8)
       .font('Helvetica-Bold')
       .text('DIGITAL PROCESS - Force de Vente | Généré le ' + new Date().toLocaleDateString('fr-FR'), { align: 'center' });
    
    doc.fillColor('#6B7280')
       .fontSize(7)
       .font('Helvetica')
       .text('📧 contact@digitalprocess.com | 🌐 www.digitalprocess.com | 📞 +216 XX XXX XXX', { align: 'center' });

    doc.end();
  }
}