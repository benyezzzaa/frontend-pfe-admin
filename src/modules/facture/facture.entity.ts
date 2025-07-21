// src/modules/facture/facture.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Commande } from '../commande/commande.entity';
import { ReglementFacture } from '../reglement-facture/reglement-facture.entity';

@Entity({ name: 'facture' })
export class Facture {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  numero_facture: string;

  @Column({ type: 'date' })
  date_emission: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montant_total: number;

  @ManyToOne(() => Commande, (commande) => commande.factures, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'commande_id' })
  commande: Commande;
  // (mise à jour) src/modules/facture/facture.entity.ts

@OneToMany(() => ReglementFacture, (reglementFacture) => reglementFacture.facture)
reglementsFactures: ReglementFacture[];

}
