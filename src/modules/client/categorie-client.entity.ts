// src/modules/client/categorie-client.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Client } from './client.entity';

@Entity()
export class CategorieClient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Client, (client) => client.categorie)
  clients: Client[];
}
