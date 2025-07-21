import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Survey } from './survey.entity';
import { User } from '../users/users.entity';
import { Client } from '../client/client.entity';

@Entity()
export class SurveyAffectation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Survey, { onDelete: 'CASCADE' })
  survey: Survey;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  commercial: User;

  @ManyToOne(() => Client, { onDelete: 'CASCADE' })
  client: Client;
} 