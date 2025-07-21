import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../users/users.entity';
import { LigneCommande } from '../lignecommande/lignecommande.entity';
import { Facture } from '../facture/facture.entity';
import { Client } from '../client/client.entity';
import { Produit } from '../produit/produit.entity';
import { Promotion } from '../Promotion/promotion.entity';
import { HistoriqueCommande } from './historique-commande.entity';

@Entity({ name: 'commande' })
export class Commande {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  numero_commande: string;

  @ManyToOne(() => Promotion, { nullable: true, eager: true })
  promotion?: Promotion;

  @Column({
    name: 'date_creation',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  dateCreation: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  prix_total_ttc: number;

  @Column({ type: 'timestamp', nullable: true })
  date_validation: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  prix_hors_taxe: number;

  @Column({ type: 'float', nullable: false })
  tva: number;

  @OneToMany(() => LigneCommande, ligne => ligne.commande, { cascade: true })
  lignesCommande: LigneCommande[];

  @ManyToOne(() => User, (user) => user.commandes, { onDelete: 'SET NULL' })
  commercial: User;

  @ManyToOne(() => Client, client => client.commandes, { eager: true })
  client: Client;

  @OneToMany(() => Facture, (facture) => facture.commande, { cascade: true })
  factures: Facture[];

  @Column({ default: 'en_attente' })
  statut: string;

  @Column({ default: false })
  estModifieParAdmin: boolean;

  @OneToMany(() => HistoriqueCommande, h => h.commande)
  historique: HistoriqueCommande[];
}
