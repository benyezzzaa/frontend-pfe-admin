import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('raison_visite')
export class RaisonVisite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nom: string;

  @Column({ default: true })
  isActive: boolean;
}
