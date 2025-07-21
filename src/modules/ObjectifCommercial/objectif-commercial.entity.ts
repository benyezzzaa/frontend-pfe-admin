import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/users.entity';

@Entity('objectif_commercial')
export class ObjectifCommercial {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'commercialId' })
  commercial: User | null;


  @Column({ type: 'date' })
  dateDebut: Date;

  @Column({ type: 'date' })
  dateFin: Date;
@Column({ default: 0, type: 'float' })
totalVentes: number;
  @Column({ type: 'decimal', nullable: false, default: 0 })
montantCible: number;

  @Column({ nullable: true })
  categorieProduit?: string;

  @Column({ type: 'float', default: 0 })
  prime: number;
 @Column({ default: false })
  atteint: boolean;
  @Column({ nullable: true })
  mission?: string;
 @Column({ type: 'decimal', default: 0 })
  ventes: number;
  @Column({ type: 'float', nullable: true })
  bonus?: number;
@Column({ type: 'float', nullable: true })
pourcentageCible?: number; // Par exemple : 30 pour 30%
  @Column({ default: true })
  isActive: boolean;
}