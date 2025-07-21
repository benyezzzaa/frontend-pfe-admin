import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Survey } from './survey.entity';

@Entity()
export class SurveyQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Survey, { onDelete: 'CASCADE' })
  survey: Survey;

  @Column()
  text: string;

  @Column()
  type: string; // 'text', 'image', 'select', etc.
} 