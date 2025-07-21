// src/modules/reglement/reglement.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { TypeReglement } from '../type-reglement/typeReglement.entity';
import { ReglementFacture } from '../reglement-facture/reglement-facture.entity';

@Entity({ name: 'reglement' })
export class Reglement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  mode_paiement: string;  // 🛠️ Méthode de paiement (ex: carte, espèce...)

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montant: number;        // 🛠️ Montant réglé

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  montantPaye: number;     // 🛠️ Montant déjà payé

  @Column({ type: 'date', nullable: true })
  datePaiement: Date;      // 🛠️ Date du paiement

  @Column({ nullable: true })
  statut: string;          // 🛠️ (ex: payé, en attente...)

  @ManyToOne(() => TypeReglement, (typeReglement) => typeReglement.reglements, { nullable: true })
  @JoinColumn({ name: 'type_reglement_id' })
  typeReglement: TypeReglement; // 🛠️ Type de règlement (ex: Acompte, Solde...)

  @OneToMany(() => ReglementFacture, (reglementFacture) => reglementFacture.reglement)
  reglementsFactures: ReglementFacture[];
}
