// src/modules/user/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Client } from '../client/client.entity';
import { Visite } from '../Visite/visite.entity';
import { Commande } from '../commande/commande.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  nom: string;
@Column({ nullable: true }) // ✅ temporairement
adresse: string;
  @Column({ nullable: false })
  prenom: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false })
  tel: string;

  @Column({ type: 'enum', enum: ['commercial', 'admin', 'bo'], default: 'commercial' })
  role: string;

  @Column({ type: 'float', nullable: true })
  latitude: number;

  @Column({ type: 'float', nullable: true })
  longitude: number;

  @Column({ default: false })
  isActive: boolean ;

  @OneToMany(() => Client, (client) => client.commercial, { cascade: true })
  clients: Client[];

  @OneToMany(() => Visite, (visite) => visite.user)
  visites: Visite[];

  @OneToMany(() => Commande, (commande) => commande.commercial)
  commandes: Commande[];
}
