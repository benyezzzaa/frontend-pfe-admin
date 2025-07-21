// --- produit.entity.ts ---
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CategorieProduit } from '../categorie-produit/categorie-produit.entity';
import { Unite } from '../unite/unite.entity';
import { LigneCommande } from '../lignecommande/lignecommande.entity';

@Entity('produit')
export class Produit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  nom: string;

  @Column({ nullable: false })
  description: string;

  

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
tva: number;

@Column({ type: 'int', default: 1 })
colisage: number;

  @Column('text', { array: true, nullable: true })
  images: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  prix_unitaire: number;

  @Column()
  categorieId: number;
@Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
prix_unitaire_ttc: number;
  @ManyToOne(() => CategorieProduit, (categorie) => categorie.produits, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'categorieId' })
  categorie: CategorieProduit;

  @Column()
  uniteId: string;

  @ManyToOne(() => Unite, (unite) => unite.produits, { eager: true })
  @JoinColumn({ name: 'uniteId', referencedColumnName: 'nom' })
  unite: Unite;

  @OneToMany(() => LigneCommande, (ligne) => ligne.produit)
  lignesCommande: LigneCommande[];

  @Column({ name: 'isactive', type: 'boolean', default: true })
  isActive: boolean;
}
