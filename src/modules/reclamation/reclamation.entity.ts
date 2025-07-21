import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/users.entity';
import { Client } from '../client/client.entity';

@Entity()
export class Reclamation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sujet: string;

  @Column({ type: 'text' })
  description: string;

  @CreateDateColumn()
  date: Date;

  @Column({ default: 'ouverte' })
  status: string; // ouverte | en_cours | résolue

  @ManyToOne(() => User, { eager: true })
  user: User;

  @ManyToOne(() => Client, { eager: true })
  client: Client;
}
