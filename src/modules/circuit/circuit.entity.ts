// 📁 src/circuit/circuit.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne } from 'typeorm';
import { User } from '../users/users.entity';
import { Client } from '../client/client.entity';

@Entity()
export class Circuit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: Date;

  @ManyToOne(() => User, { eager: true })
  commercial: User;

  @ManyToMany(() => Client, { eager: true })
  @JoinTable()
  clients: Client[];
}
