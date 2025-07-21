import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Reglement } from '../reglement/reglement.entity';
import { Facture } from '../facture/facture.entity';

@Entity({ name: 'reglement_facture' })
export class ReglementFacture {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Reglement, (reglement) => reglement.reglementsFactures, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reglement_id' })
  reglement: Reglement;

  @ManyToOne(() => Facture, (facture) => facture.reglementsFactures, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facture_id' })
  facture: Facture;
}
