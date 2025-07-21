import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany, OneToMany } from 'typeorm';
import { User } from '../users/users.entity';
import { Client } from '../client/client.entity';
import { RaisonVisite } from '../raison-visite/raison-visite.entity'; // ✅ IMPORTER ICI

@Entity()
export class Visite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @ManyToOne(() => Client, { eager: true })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @ManyToOne(() => RaisonVisite, { eager: true })
  @JoinColumn({ name: 'raison_id' })
  raison: RaisonVisite; // ✅ UNIQUE et bien typé
}
