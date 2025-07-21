import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Commande } from '../commande/commande.entity';
import { Produit } from '../produit/produit.entity';
import { User } from '../users/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Commande)
    private commandeRepository: Repository<Commande>,

    @InjectRepository(Produit)
    private produitRepository: Repository<Produit>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getStats() {
    const totalCommandes = await this.commandeRepository.count();
    const totalProduits = await this.produitRepository.count();
    const totalUtilisateurs = await this.userRepository.count();
    return { totalCommandes, totalProduits, totalUtilisateurs };
  }

  async getVentesParCommercial() {
    const result = await this.commandeRepository
      .createQueryBuilder('commande')
      .leftJoin('commande.commercial', 'commercial')
      .select('commercial.prenom', 'commercial')
      .addSelect('SUM(commande.prix_total_ttc)', 'total')
      .groupBy('commercial.prenom')
      .getRawMany();

    return result.map(r => ({
      commercial: r.commercial,
      total: parseFloat(r.total),
    }));
  }

  async getVentesParCategorie() {
    const result = await this.produitRepository
      .createQueryBuilder('produit')
      .leftJoin('produit.categorie', 'categorie')
      .select('categorie.nom', 'categorie')
      .addSelect('COUNT(produit.id)', 'quantite')
      .groupBy('categorie.nom')
      .getRawMany();

    return result.map(r => ({
      categorie: r.categorie,
      quantite: parseInt(r.quantite, 10),
    }));
  }

 async getVentesParMois() {
  // Obtenir l'année courante
  const currentYear = new Date().getFullYear();
  
  const result = await this.commandeRepository
    .createQueryBuilder('commande')
    .select("EXTRACT(MONTH FROM commande.dateCreation)", 'mois_num')
    .addSelect("TO_CHAR(commande.dateCreation, 'TMMonth')", 'mois') // Format complet en français
    .addSelect('COALESCE(SUM(commande.prix_total_ttc), 0)', 'montant')
    .where("EXTRACT(YEAR FROM commande.dateCreation) = :year", { year: currentYear })
    .groupBy('mois_num, mois')
    .orderBy('mois_num', 'ASC')
    .getRawMany();

  // Créer un tableau pour tous les mois
  const allMonths = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(currentYear, i, 1);
    return {
      mois_num: i + 1,
      mois: date.toLocaleString('fr-FR', { month: 'long' })
    };
  });

  // Fusionner avec les résultats
  return allMonths.map(month => {
    const found = result.find(r => r.mois_num == month.mois_num);
    return {
      mois: month.mois.charAt(0).toUpperCase() + month.mois.slice(1), // Capitaliser
      montant: found ? parseFloat(found.montant) : 0
    };
  });
}
}
