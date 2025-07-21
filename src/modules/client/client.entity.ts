import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../users/users.entity';
import { Commande } from '../commande/commande.entity';
import { CategorieClient } from './categorie-client.entity';

@Entity({ name: 'client' })
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'double precision', nullable: true })
  latitude: number;

  @Column({ type: 'double precision', nullable: true })
  longitude: number;

  @Column({ nullable: false })
  nom: string;

  @Column({ nullable: false })
  prenom: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  telephone: string;

  @Column({ nullable: true })
  codeFiscale?: string;

  @Column({ nullable: false })
  adresse: string;

  @Column({ default: 3 })
  importance: number;

  @Column({ default: true })
  isActive: boolean;

  // ✅ Relation avec les commandes
  @OneToMany(() => Commande, commande => commande.client)
  commandes: Commande[];

  // ✅ Relation avec le commercial
  @ManyToOne(() => User, (user) => user.clients, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'commercial_id' })
  commercial: User;

  // ✅ Relation avec catégorie client
  @ManyToOne(() => CategorieClient, (categorie) => categorie.clients, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'categorie_id' })
  categorie?: CategorieClient;

  // Tu peux ajouter d'autres relations ici si besoin (ex: surveys)
}
