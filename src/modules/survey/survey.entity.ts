import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { SurveyQuestion } from './survey-question.entity';

@Entity()
export class Survey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column({ type: 'date' })
  dateDebut: string;

  @Column({ type: 'date' })
  dateFin: string;

  @OneToMany(() => SurveyQuestion, question => question.survey)
  questions: SurveyQuestion[];

  @CreateDateColumn()
  createdAt: Date;
} 