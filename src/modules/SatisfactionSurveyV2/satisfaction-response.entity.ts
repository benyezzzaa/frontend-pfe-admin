import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { SatisfactionSurvey } from './satisfaction-survey.entity';

@Entity()
export class SatisfactionResponse {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SatisfactionSurvey)
  survey: SatisfactionSurvey;

  @Column()
  nomClient: string;

  @Column({ type: 'text' })
  reponse: string;

  @CreateDateColumn()
  createdAt: Date;
} 