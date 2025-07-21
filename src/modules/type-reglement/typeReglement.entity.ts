import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Reglement } from '../reglement/reglement.entity';

@Entity({ name: 'type_reglement' })
export class TypeReglement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, type: 'varchar', length: 50 })
  nom: string;

  @OneToMany(() => Reglement, (reglement) => reglement.typeReglement)
  reglements: Reglement[];
}
