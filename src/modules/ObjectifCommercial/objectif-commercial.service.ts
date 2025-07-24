import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, MoreThan } from 'typeorm';
import { ObjectifCommercial } from './objectif-commercial.entity';
import { User } from '../users/users.entity';
import { CreateObjectifDto, CreateObjectifGlobalDto } from './DTO/create-objectif.dto';
import { Commande } from '../commande/commande.entity';

@Injectable()
export class ObjectifCommercialService {
  constructor(
    @InjectRepository(ObjectifCommercial)
    private objectifRepo: Repository<ObjectifCommercial>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Commande)
    private commandeRepo: Repository<Commande>,
  ) {}

  async create(dto: CreateObjectifDto): Promise<ObjectifCommercial> {
    if (!dto.commercialId) {
      throw new BadRequestException('commercialId est requis pour un objectif individuel');
    }

    const user = await this.userRepo.findOneByOrFail({ id: dto.commercialId });

    const objectif = this.objectifRepo.create({
      commercial: user,
      montantCible: dto.montantCible,
      prime: dto.prime,
      mission: dto.mission || `Vendre pour ${dto.montantCible} €`,
      dateDebut: dto.dateDebut,
      dateFin: dto.dateFin,
      totalVentes: 0,
      isActive: true,
    });
    return this.objectifRepo.save(objectif);
  }

  async createGlobal(createDto: CreateObjectifGlobalDto): Promise<ObjectifCommercial> {
    const objectif = this.objectifRepo.create({
      commercial: null, // Objectif global sans commercial spécifique
      dateDebut: new Date(createDto.dateDebut),
      dateFin: new Date(createDto.dateFin),
      montantCible: createDto.montantCible,
      prime: createDto.prime,
      mission: createDto.mission || `Objectif global: ${createDto.montantCible} €`,
      totalVentes: 0,
      isActive: true,
    });
    return this.objectifRepo.save(objectif);
  }

  async findAll(): Promise<any[]> {
    console.log('🔍 findAll() appelé - Récupération de tous les objectifs');
    
    const objectifs = await this.objectifRepo.find({
      relations: ['commercial'],
      order: { id: 'DESC' },
    });

    console.log(`📊 ${objectifs.length} objectifs trouvés`);

    // Calculer les ventes pour chaque objectif
    const result = await Promise.all(objectifs.map(async (obj) => {
      let montantRealise = 0;
      
      if (obj.commercial) {
        console.log(`💰 Calcul des ventes pour ${obj.commercial.nom} ${obj.commercial.prenom} - Objectif: ${obj.mission}`);
        console.log(`📅 Période: ${obj.dateDebut} à ${obj.dateFin}`);
        
        // Calculer les ventes du commercial pour la période de l'objectif
        // Essayer d'abord avec date_validation, sinon utiliser date_creation
        let ventesResult = await this.commandeRepo
          .createQueryBuilder('commande')
          .where('commande.commercialId = :userId', { userId: obj.commercial.id })
          .andWhere('commande.statut = :statut', { statut: 'validee' })
          .andWhere('commande.date_validation BETWEEN :dateDebut AND :dateFin', { 
            dateDebut: obj.dateDebut, 
            dateFin: obj.dateFin 
          })
          .select('SUM(commande.prix_total_ttc)', 'total')
          .getRawOne();

        // Si pas de résultats avec date_validation, essayer avec date_creation
        if (!ventesResult || parseFloat(ventesResult.total || '0') === 0) {
          console.log(`⚠️ Pas de ventes avec date_validation, essai avec date_creation`);
          ventesResult = await this.commandeRepo
            .createQueryBuilder('commande')
            .where('commande.commercialId = :userId', { userId: obj.commercial.id })
            .andWhere('commande.statut = :statut', { statut: 'validee' })
            .andWhere('commande.dateCreation BETWEEN :dateDebut AND :dateFin', { 
              dateDebut: obj.dateDebut, 
              dateFin: obj.dateFin 
            })
            .select('SUM(commande.prix_total_ttc)', 'total')
            .getRawOne();
        }

        montantRealise = parseFloat(ventesResult?.total || '0');
        
        // Debug: vérifier toutes les commandes du commercial
        const allCommandes = await this.commandeRepo
          .createQueryBuilder('commande')
          .where('commande.commercialId = :userId', { userId: obj.commercial.id })
          .select(['commande.statut', 'commande.prix_total_ttc', 'commande.dateCreation', 'commande.date_validation'])
          .getMany();
        
        console.log(`📦 Total commandes du commercial: ${allCommandes.length}`);
        console.log(`📊 Statuts des commandes:`, allCommandes.map(cmd => `${cmd.statut}: ${cmd.prix_total_ttc}€`));
        
        console.log(`💶 Ventes calculées: ${montantRealise}€ / Objectif: ${obj.montantCible}€`);
        console.log(`✅ Atteint: ${montantRealise >= obj.montantCible}`);
      }

      const resultObj = {
        ...obj,
        montantRealise,
        isAtteint: obj.montantCible ? montantRealise >= obj.montantCible : false,
      };

      console.log(`📋 Objectif final: ${resultObj.mission} - Réalisé: ${resultObj.montantRealise}€ - Atteint: ${resultObj.isAtteint}`);
      
      return resultObj;
    }));

    console.log(`✅ findAll() terminé - ${result.length} objectifs avec ventes calculées`);
    return result;
  }

  async toggleStatus(id: number): Promise<ObjectifCommercial> {
    const obj = await this.objectifRepo.findOneBy({ id });
    if (!obj) throw new NotFoundException('Objectif introuvable');
    obj.isActive = !obj.isActive;
    return this.objectifRepo.save(obj);
  }

  async getGlobalMontantProgress() {
    const commerciaux = await this.userRepo.find({
      where: { role: 'commercial', isActive: true },
    });

    const result: any[] = [];

    for (const commercial of commerciaux) {
      const objectifs = await this.objectifRepo.find({
        where: { commercial: { id: commercial.id }, isActive: true },
      });

      const totalVente = await this.commandeRepo
        .createQueryBuilder('commande')
        .where('commande.commercialId = :id', { id: commercial.id })
        .select('SUM(commande.prix_total_ttc)', 'total')
        .getRawOne();

      const total = parseFloat(totalVente?.total || '0');

      for (const obj of objectifs) {
        const atteint = obj.montantCible ? total >= obj.montantCible : false;

        result.push({
          commercial: {
            id: commercial.id,
            nom: commercial.nom,
            prenom: commercial.prenom,
          },
          objectifId: obj.id,
          mission: obj.mission,
          montantCible: obj.montantCible,
          ventes: total,
          prime: obj.prime,
          atteint,
        });
      }
    }

    return result;
  }

  async getByCommercialGroupedByYear(userId: number) {
    const objectifs = await this.objectifRepo.find({
      where: { commercial: { id: userId } },
      relations: ['commercial'],
    });

    const grouped = objectifs.reduce((acc, obj) => {
      const year = new Date(obj.dateDebut).getFullYear();
      if (!acc[year]) acc[year] = [];
      acc[year].push(obj);
      return acc;
    }, {} as Record<number, ObjectifCommercial[]>);

    return grouped;
  }

  async getSalesByCategory(userId: number) {
    return this.commandeRepo
      .createQueryBuilder('commande')
      .leftJoin('commande.lignesCommande', 'ligne')
      .leftJoin('ligne.produit', 'produit')
      .leftJoin('produit.categorie', 'categorie')
      .select('categorie.nom', 'categorie')
      .addSelect('SUM(ligne.quantite)', 'totalQuantite')
      .where('commande.commercialId = :userId', { userId })
      .groupBy('categorie.nom')
      .getRawMany();
  }

  async getProgressForAdmin(): Promise<
  {
    id: number;
    commercial: User;
    categorie: string | null;
    objectif: number | null;
    realise: number;
    atteint: boolean;
  }[]
> {
  const objectifs = await this.objectifRepo.find({
    relations: ['commercial'],
  });

  const results: {
    id: number;
    commercial: User;
    categorie: string | null;
    objectif: number | null;
    realise: number;
    atteint: boolean;
  }[] = []; // ✅ Type explicite ici

  for (const obj of objectifs) {
    if (!obj.commercial) continue;

    const ventes = await this.commandeRepo
      .createQueryBuilder('commande')
      .leftJoin('commande.lignesCommande', 'ligne')
      .leftJoin('ligne.produit', 'produit')
      .leftJoin('produit.categorie', 'categorie')
      .select('SUM(ligne.quantite)', 'total')
      .where('commande.commercialId = :id', { id: obj.commercial.id })
      .andWhere('categorie.nom = :cat', { cat: obj.categorieProduit })
      .getRawOne();

    const totalCat = parseFloat(ventes?.total || '0');

    const allVentes = await this.commandeRepo
      .createQueryBuilder('commande')
      .leftJoin('commande.lignesCommande', 'ligne')
      .where('commande.commercialId = :id', { id: obj.commercial.id })
      .select('SUM(ligne.quantite)', 'total')
      .getRawOne();

    const totalVentes = parseFloat(allVentes?.total || '0');
    const pourcentage = totalVentes === 0 ? 0 : (totalCat / totalVentes) * 100;

    results.push({
      id: obj.id,
      commercial: obj.commercial,
      categorie: obj.categorieProduit ?? null,
      objectif: obj.pourcentageCible ?? null,
      realise: Number(pourcentage.toFixed(1)),
      atteint: obj.pourcentageCible ? pourcentage >= obj.pourcentageCible : false,
    });
  }

  return results;
}




  async getObjectifsProgress(userId: number) {
    console.log(`🔍 getObjectifsProgress appelé pour userId: ${userId}`);
    const today = new Date();
    // Récupérer UNIQUEMENT les objectifs spécifiques au commercial connecté et non expirés
    const objectifsCommercial = await this.objectifRepo.find({
      where: {
        commercial: { id: userId },
        isActive: true,
        dateFin: MoreThan(today),
      },
      relations: ['commercial'],
    });
    console.log(`📊 Objectifs spécifiques au commercial ${userId} (non expirés): ${objectifsCommercial.length}`);
    
    // Log des détails de chaque objectif trouvé
    objectifsCommercial.forEach((obj, index) => {
      console.log(`  ${index + 1}. Commercial: ${obj.commercial?.nom} ${obj.commercial?.prenom} - Mission: ${obj.mission}`);
    });

    // Calcul du réalisé pour chaque objectif (commandes validées sur la période de l'objectif, selon date de validation)
    const result = await Promise.all(objectifsCommercial.map(async (obj) => {
      const ventesResult = await this.commandeRepo
      .createQueryBuilder('commande')
      .where('commande.commercialId = :userId', { userId })
        .andWhere('commande.statut = :statut', { statut: 'validee' })
        .andWhere('commande.date_validation BETWEEN :dateDebut AND :dateFin', { dateDebut: obj.dateDebut, dateFin: obj.dateFin })
      .select('SUM(commande.prix_total_ttc)', 'total')
      .getRawOne();

      const ventes = parseFloat(ventesResult?.total || '0');

      return {
      id: obj.id,
      mission: obj.mission,
      dateDebut: obj.dateDebut,
      dateFin: obj.dateFin,
      prime: obj.prime,
        ventes,
      montantCible: obj.montantCible,
        atteint: obj.montantCible ? ventes >= obj.montantCible : false,
        isGlobal: false,
      };
    }));
    
    console.log(`✅ Retourne ${result.length} objectifs PERSONNELS pour le commercial ${userId}`);
    result.forEach((obj, index) => {
      console.log(`  ${index + 1}. [PERSONNEL] ${obj.mission} - Cible: ${obj.montantCible}€ - Réalisé: ${obj.ventes}€`);
    });
    return result;
  }

  async update(id: number, updateData: Partial<ObjectifCommercial>) {
    const objectif = await this.objectifRepo.findOneBy({ id });
    if (!objectif) throw new NotFoundException('Objectif introuvable');
    Object.assign(objectif, updateData);
    return this.objectifRepo.save(objectif);
  }

  async remove(id: number) {
    const objectif = await this.objectifRepo.findOneBy({ id });
    if (!objectif) throw new NotFoundException('Objectif introuvable');
    return this.objectifRepo.remove(objectif);
  }
}
