// historique-commande.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Commande } from './commande.entity';
import { User } from '../users/users.entity';

@Entity()
export class HistoriqueCommande {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Commande, commande => commande.id, { onDelete: 'CASCADE' })
  commande: Commande;

  @Column()
  champModifie: string;

  @Column()
  ancienneValeur: string;

  @Column()
  nouvelleValeur: string;

  @ManyToOne(() => User)
  modifiePar: User;

  @CreateDateColumn()
  dateModification: Date;
@Column({ default: false })
vuParCommercial: boolean;
}
