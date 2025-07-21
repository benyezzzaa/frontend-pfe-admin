// ✅ categorie-produit.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Produit } from '../produit/produit.entity';

@Entity({ name: 'categorie_produit' })
export class CategorieProduit {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1 })
  id: number;

  
  @Column({ type: 'varchar', nullable: false, unique: true })
  @ApiProperty({ example: 'Boissons' })
  nom: string;
  

  @OneToMany(() => Produit, (produit) => produit.categorie)
  produits: Produit[];

  @Column({ type: 'boolean', default: true })
  @ApiProperty({ example: true })
  isActive: boolean;
}