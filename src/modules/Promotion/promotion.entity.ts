// promotion.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('promotion')
export class Promotion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titre: string;
@ManyToOne(() => Promotion, { nullable: true })
promotion: Promotion;
  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'float' })
  tauxReduction: number;

  @Column({ type: 'date' })
  dateDebut: Date;

  @Column({ type: 'date' })
  dateFin: Date;

  @Column({ default: true })
isActive: boolean;
  // promotion.entity.ts

}
