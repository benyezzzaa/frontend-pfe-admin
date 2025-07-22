  import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { Commande } from './commande.entity';
  import { LigneCommande } from '../lignecommande/lignecommande.entity';
  import { CreateCommandeDto } from './dto/create-commande.dto';
  import { User } from '../users/users.entity';
  import { Produit } from '../produit/produit.entity';
  import { UpdateCommandeDto } from './dto/update-commande.dto';
  import * as PDFDocument from 'pdfkit';
  import { Response } from 'express';
  import { Readable } from 'stream';

  import * as getStream from 'get-stream';
  import { Promotion } from '../Promotion/promotion.entity';
  import { HistoriqueCommande } from './historique-commande.entity';
import { Client } from '../client/client.entity';
  @Injectable()
  export class CommandeService {
    findCommandeById(id: number) {
      throw new Error('Method not implemented.');
    }
    constructor(
      @InjectRepository(Commande)
      private commandeRepository: Repository<Commande>,

      @InjectRepository(LigneCommande)
      private ligneCommandeRepository: Repository<LigneCommande>,

      @InjectRepository(Produit)
      private produitRepository: Repository<Produit>,
      @InjectRepository(Promotion)
      private promotionRepository: Repository<Promotion>,
      @InjectRepository(Client)
  private clientRepository: Repository<Client>,
      // commande.service.ts
  @InjectRepository(HistoriqueCommande)
  private historiqueCommandeRepository: Repository<HistoriqueCommande>,
    ) {}

  /**
   * Génère un numéro de commande unique et séquentiel
   * Format: CMD-YYYY-XXXXX (ex: CMD-2025-00001)
   */
  private async generateUniqueNumeroCommande(): Promise<string> {
    const currentYear = new Date().getFullYear();
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      // Trouver la dernière commande de l'année en cours
      const lastCommande = await this.commandeRepository
        .createQueryBuilder('commande')
        .where('commande.numero_commande LIKE :pattern', { 
          pattern: `CMD-${currentYear}-%` 
        })
        .orderBy('commande.numero_commande', 'DESC')
        .getOne();

      let sequenceNumber = 1;
      
      if (lastCommande) {
        // Extraire le numéro de séquence de la dernière commande
        const match = lastCommande.numero_commande.match(new RegExp(`CMD-${currentYear}-(\\d+)`));
        if (match) {
          sequenceNumber = parseInt(match[1]) + 1;
        }
      }

      // Ajouter un offset basé sur le timestamp pour éviter les conflits
      const timestamp = Date.now();
      const offset = (timestamp % 1000) + attempts;
      sequenceNumber += offset;

      // Formater le numéro de séquence avec des zéros (5 chiffres)
      const formattedSequence = sequenceNumber.toString().padStart(5, '0');
      const numeroCommande = `CMD-${currentYear}-${formattedSequence}`;

      // Vérifier si ce numéro existe déjà
      const existingCommande = await this.commandeRepository.findOne({
        where: { numero_commande: numeroCommande }
      });

      if (!existingCommande) {
        return numeroCommande;
      }

      attempts++;
    }

    // Si on arrive ici, utiliser un timestamp complet comme fallback
    const timestamp = Date.now();
    return `CMD-${currentYear}-${timestamp}`;
  }

  /**
   * Nettoie et corrige les anciens numéros de commande incorrects
   * Utile pour migrer les données existantes
   */
  async cleanOldCommandeNumbers(): Promise<{ updated: number }> {
    const commandesWithBadNumbers = await this.commandeRepository
      .createQueryBuilder('commande')
      .where('commande.numero_commande LIKE :pattern1', { pattern1: '%[%' })
      .orWhere('commande.numero_commande LIKE :pattern2', { pattern2: '%m%' })
      .orWhere('commande.numero_commande NOT LIKE :pattern3', { pattern3: 'CMD-%' })
      .getMany();

    let updatedCount = 0;
    
    for (const commande of commandesWithBadNumbers) {
      const newNumero = await this.generateUniqueNumeroCommande();
      commande.numero_commande = newNumero;
      await this.commandeRepository.save(commande);
      updatedCount++;
    }

    return { updated: updatedCount };
  }

  /**
   * Nettoie les numéros de commande en double
   * Utile pour corriger les problèmes de contrainte unique
   */
  async fixDuplicateCommandeNumbers(): Promise<{ fixed: number, duplicates: any[] }> {
    // Trouver les doublons
    const duplicates = await this.commandeRepository
      .createQueryBuilder('commande')
      .select('commande.numero_commande')
      .addSelect('COUNT(*)', 'count')
      .groupBy('commande.numero_commande')
      .having('COUNT(*) > 1')
      .getRawMany();

    let fixedCount = 0;

    for (const duplicate of duplicates) {
      const commandesWithSameNumber = await this.commandeRepository.find({
        where: { numero_commande: duplicate.numero_commande },
        order: { dateCreation: 'ASC' }
      });

      // Garder la première commande, corriger les autres
      for (let i = 1; i < commandesWithSameNumber.length; i++) {
        const commande = commandesWithSameNumber[i];
        const newNumero = await this.generateUniqueNumeroCommande();
        commande.numero_commande = newNumero;
        await this.commandeRepository.save(commande);
        fixedCount++;
      }
    }

    return { 
      fixed: fixedCount, 
      duplicates: duplicates.map(d => ({ numero: d.numero_commande, count: parseInt(d.count) }))
    };
  }
  async generatePdf(id: number): Promise<Buffer> {
    const commande = await this.commandeRepository.findOne({
      where: { id },
      relations: ['lignesCommande', 'lignesCommande.produit', 'client'],
    });

    if (!commande) {
      throw new Error('Commande introuvable.');
    }

    if (!commande.lignesCommande || commande.lignesCommande.length === 0) {
      throw new Error('La commande ne contient aucune ligne.');
    }

    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    return new Promise<Buffer>((resolve, reject) => {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(18).text(`Commande #${commande.numero_commande}`, { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(`Client : ${commande.client.nom}`);
      doc.text(`Date : ${commande.dateCreation}`);
      doc.text(`Statut : ${commande.statut}`);
      doc.text(`Total TTC : ${commande.prix_total_ttc} DT`);
      doc.moveDown();

      doc.fontSize(14).text('Produits commandés :');
      commande.lignesCommande.forEach((ligne) => {
        doc.fontSize(12).text(
          `- ${ligne.produit.nom} x${ligne.quantite} = ${ligne.total} DT`
        );
      });

      doc.end();
    });
  }
async getDetailsCommandeModifiee(commandeId: number): Promise<HistoriqueCommande[]> {
    return this.historiqueCommandeRepository.find({
      where: { commande: { id: commandeId } },
      relations: ['commande', 'modifiePar'],
      order: { dateModification: 'DESC' },
    });
  }
async marquerNotificationCommeVue(id: number): Promise<{ message: string }> {
    const historique = await this.historiqueCommandeRepository.findOne({
      where: { id },
      relations: ['commande', 'commande.commercial'],
    });

    if (!historique) {
      throw new NotFoundException('Notification non trouvée.');
    }

    historique.vuParCommercial = true;
    await this.historiqueCommandeRepository.save(historique);
    return { message: `Notification marquée comme vue.` };
  }

   async getNombreNotificationsNonVues(commercialId: number): Promise<number> {
    return this.historiqueCommandeRepository.count({
      where: {
        vuParCommercial: false,
        commande: {
          commercial: { id: commercialId },
        },
      },
      relations: ['commande', 'commande.commercial'],
    });
  }

async createCommande(dto: CreateCommandeDto, commercial: User): Promise<Commande> {
  if (commercial.role !== 'commercial') {
    throw new ForbiddenException('Seuls les commerciaux peuvent créer des commandes.');
  }

  // Génération d'un numéro de commande unique et séquentiel
  const numeroCommande = await this.generateUniqueNumeroCommande();

  const commande = this.commandeRepository.create({
    numero_commande: numeroCommande,
    commercial: commercial,
    client: { id: dto.clientId },
    statut: 'en_attente',
    estModifieParAdmin: false,
    prix_total_ttc: 0,
    prix_hors_taxe: 0,
    tva: 0,
    promotion: dto.promotionId ? { id: dto.promotionId } : undefined,
  });

  // Tentative de sauvegarde avec gestion des conflits de numéros
  let savedCommande: Commande | null = null;
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      savedCommande = await this.commandeRepository.save(commande);
      break;
    } catch (error) {
      attempts++;
      
      // Si c'est une erreur de contrainte unique sur numero_commande
      if (error.code === '23505' && error.constraint === 'UQ_a7f83d06c017678ec4cb3628ffb') {
        if (attempts >= maxAttempts) {
          throw new BadRequestException('Impossible de générer un numéro de commande unique. Veuillez réessayer.');
        }
        
        // Régénérer un nouveau numéro de commande
        commande.numero_commande = await this.generateUniqueNumeroCommande();
        continue;
      }
      
      // Si c'est une autre erreur, la relancer
      throw error;
    }
  }

  // Vérifier que la commande a été sauvegardée
  if (!savedCommande) {
    throw new BadRequestException('Erreur lors de la sauvegarde de la commande.');
  }

  let totalHT = 0;
  let totalTVA = 0;
  let totalTTC = 0;

  for (const ligne of dto.lignesCommande) {
    const produit = await this.produitRepository.findOneBy({ id: ligne.produitId });
    if (!produit) {
      throw new NotFoundException(`Produit ${ligne.produitId} introuvable.`);
    }

    const totalLigneHT = produit.prix_unitaire * ligne.quantite;
    const tvaLigne = produit.tva;
    const totalLigneTVA = totalLigneHT * (tvaLigne / 100);
    const totalLigneTTC = totalLigneHT + totalLigneTVA;

    totalHT += totalLigneHT;
    totalTVA += totalLigneTVA;
    totalTTC += totalLigneTTC;

    const ligneCommande = this.ligneCommandeRepository.create({
  quantite: ligne.quantite,
  prixUnitaire: produit.prix_unitaire,
  prixUnitaireTTC: produit.prix_unitaire_ttc,
  tva: produit.tva,
  totalHT: totalLigneHT,
  total: totalLigneTTC, // ou totalTTC
  produit: produit,
  commande: savedCommande,
});

    await this.ligneCommandeRepository.save(ligneCommande);
  }

  const tvaMoyennePonderee = totalHT > 0 ? (totalTVA / totalHT) * 100 : 0;

  savedCommande.prix_hors_taxe = parseFloat(totalHT.toFixed(2));
  savedCommande.prix_total_ttc = parseFloat(totalTTC.toFixed(2));
  savedCommande.tva = parseFloat(tvaMoyennePonderee.toFixed(2));

  return await this.commandeRepository.save(savedCommande);
}




  async findAllByCommercial(userId: number, filters?: any): Promise<Commande[]> {
    return this.commandeRepository.find({
      where: { commercial: { id: userId } },
      
      relations: ['client', 'lignesCommande'],
      order: { dateCreation: 'DESC' },
    });
  }
 async getCommandesByCommercial(userId: number) {
    return this.commandeRepository.find({
      where: { commercial: { id: userId } },
      relations: ['client', 'lignesCommande', 'lignesCommande.produit'],
    });
  }
  async getAllCommandes(): Promise<Commande[]> {
    return this.commandeRepository.find({
      relations: [
        'client', // ✅ important pour Flutter
        'lignesCommande',
        'lignesCommande.produit',
        'commercial',
        'promotion',
      ],
      order: { id: 'DESC' },
    });
  }


   async getBandeDeCommande(id: number) {
    const commande = await this.commandeRepository.findOne({
      where: { id },
      relations: ['lignesCommande', 'lignesCommande.produit', 'commercial', 'client', 'promotion'],
    });

    if (!commande) {
      throw new NotFoundException(`Commande avec ID ${id} introuvable`);
    }

    const totalAvantRemise = commande.prix_total_ttc;

    let prixAvantReduction = totalAvantRemise;
    if (commande.promotion) {
      const reduction = commande.promotion.tauxReduction || 0;
      prixAvantReduction = +(totalAvantRemise / (1 - reduction / 100)).toFixed(2);
    }

    return {
      numeroCommande: commande.numero_commande,
      date: commande.dateCreation,
      commercial: {
        nom: commande.commercial?.nom,
        prenom: commande.commercial?.prenom,
        email: commande.commercial?.email,
      },
      client: {
        nom: commande.client?.nom,
        prenom: commande.client?.prenom,
        code_fiscal: commande.client?.codeFiscale,
      },
      produits: commande.lignesCommande.map((ligne) => ({
        id: ligne.id,
        nomProduit: ligne.produit?.nom,
        quantite: ligne.quantite,
        prixUnitaire: ligne.prixUnitaire,
        tva: ligne.tva,
        prixTTC: ligne.prixUnitaireTTC,
        totalHT: ligne.totalHT,
        total: ligne.total,
      })),
      prixTotalTTC: Number(commande.prix_total_ttc),
      prixHorsTaxe: Number(commande.prix_hors_taxe),
      prixAvantReduction,
      promotion: commande.promotion
        ? {
            nom: commande.promotion.titre,
            reductionPourcentage: commande.promotion.tauxReduction ?? 0,
          }
        : null,
    };
  }
async getCommandesModifieesParAdmin(commercialId: number) {
  return this.commandeRepository.find({
    where: {
      commercial: { id: commercialId },
      estModifieParAdmin: true,
    },
    relations: ['client', 'lignesCommande', 'promotion'],
    order: { dateCreation: 'DESC' },
  });
}
async marquerCommandeCommeModifiee(commandeId: number, modifiePar: User, champ: string, ancienneValeur: string, nouvelleValeur: string) {
    const commande = await this.commandeRepository.findOne({
      where: { id: commandeId },
      relations: ['commercial'],
    });
    if (!commande) throw new NotFoundException('Commande introuvable');

    commande.estModifieParAdmin = true;
    await this.commandeRepository.save(commande);

    const historique = this.historiqueCommandeRepository.create({
      commande,
      champModifie: champ,
      ancienneValeur,
      nouvelleValeur,
      modifiePar,
      vuParCommercial: false,
    });
    await this.historiqueCommandeRepository.save(historique);
  }
 async updateCommande(id: number, updateDto: UpdateCommandeDto): Promise<Commande> {
  const commande = await this.commandeRepository.findOne({
    where: { id },
    relations: ['lignesCommande', 'lignesCommande.produit', 'commercial'],
  });

  if (!commande) {
    throw new NotFoundException(`Commande introuvable`);
  }

  let modificationEffectuee = false;
  let totalHT = 0;
  let totalTVA = 0;
  let totalTTC = 0;

  if (updateDto.lignesCommande?.length) {
    for (const ligneUpdate of updateDto.lignesCommande) {
      const ligne = await this.ligneCommandeRepository.findOne({
        where: { id: ligneUpdate.id },
        relations: ['produit'],
      });

      if (!ligne) continue;

      const ancienneQuantite = ligne.quantite;
      const nouvelleQuantite = ligneUpdate.quantite;

      // ⛔ Blocage des quantités ≤ 0
      if (nouvelleQuantite <= 0) {
        throw new BadRequestException(
          `La quantité du produit ${ligne.produit.nom} doit être supérieure à 0`
        );
      }

      if (nouvelleQuantite !== ancienneQuantite) {
        ligne.quantite = nouvelleQuantite;

        ligne.totalHT = parseFloat((ligne.prixUnitaire * ligne.quantite).toFixed(2));
        ligne.total = parseFloat((ligne.totalHT * (1 + ligne.tva / 100)).toFixed(2));

        await this.ligneCommandeRepository.save(ligne);

        await this.marquerCommandeCommeModifiee(
          commande.id,
          { id: updateDto.modifiePar } as User,
          `Quantité - ${ligne.produit.nom}`,
          ancienneQuantite.toString(),
          nouvelleQuantite.toString()
        );

        modificationEffectuee = true;
      }
    }
  }

  if (modificationEffectuee) {
    const lignesMajorees = await this.ligneCommandeRepository.find({
      where: { commande: { id } },
    });

    for (const ligne of lignesMajorees) {
      const ligneHT = Number(ligne.totalHT);
      const ligneTTC = Number(ligne.total);

      if (isNaN(ligneHT) || isNaN(ligneTTC)) {
        throw new BadRequestException(`Ligne ${ligne.id} a un total invalide`);
      }

      totalHT += ligneHT;
      totalTTC += ligneTTC;
      totalTVA += ligneTTC - ligneHT;
    }

    const tvaMoyenne = totalHT > 0 ? (totalTVA / totalHT) * 100 : 0;

    commande.prix_hors_taxe = parseFloat(totalHT.toFixed(2));
    commande.prix_total_ttc = parseFloat(totalTTC.toFixed(2));
    commande.tva = parseFloat(tvaMoyenne.toFixed(2));
    commande.estModifieParAdmin = true;

    await this.commandeRepository.save(commande);
  }

  return commande;
}

    
 async getCommandesModifieesPourCommercial(commercialId: number): Promise<any[]> {
    const commandes = await this.commandeRepository.find({
      where: {
        commercial: { id: commercialId },
        estModifieParAdmin: true,
      },
      relations: ['client', 'lignesCommande', 'lignesCommande.produit', 'promotion'],
      order: { dateCreation: 'DESC' },
    });

    const commandesAvecNotifications = await Promise.all(
      commandes.map(async (commande) => {
        const notificationsNonVues = await this.historiqueCommandeRepository.count({
          where: {
            commande: { id: commande.id },
            vuParCommercial: false,
          },
        });

        return {
          ...commande,
          notificationsNonVues,
          vu: notificationsNonVues === 0,
        };
      })
    );

    return commandesAvecNotifications;
  }
  async marquerModificationsCommeVues(commercialId: number) {
    const historiques = await this.historiqueCommandeRepository.find({
      where: { vuParCommercial: false },
      relations: ['commande', 'commande.commercial'],
    });

    const àMarquer = historiques.filter(h => h.commande.commercial.id === commercialId);
    for (const h of àMarquer) {
      h.vuParCommercial = true;
      await this.historiqueCommandeRepository.save(h);
    }

    return { message: `${àMarquer.length} notifications marquées comme vues.` };
  }

    async getCommandesValidees(): Promise<Commande[]> {
      return this.commandeRepository.find({
        where: { statut: 'validee' },
        relations: ['lignesCommande', 'lignesCommande.produit', 'commercial'],
        order: { id: 'DESC' },
      });
    }
    
    async validerCommande(id: number) {
    const commande = await this.commandeRepository.findOne({ where: { id } });
    if (!commande) {
      throw new NotFoundException('Commande introuvable');
    }
    commande.statut = 'validee';
    commande.date_validation = new Date();
    return this.commandeRepository.save(commande);
  }

  async rejeterCommande(id: number, motifRejet: string) {
    const commande = await this.commandeRepository.findOne({ where: { id } });
    if (!commande) {
      throw new NotFoundException('Commande introuvable');
    }
    commande.statut = 'rejetee';
    commande.motif_rejet = motifRejet;
    return this.commandeRepository.save(commande);
  }

  async deleteCommande(id: number) {
      const commande = await this.commandeRepository.findOneBy({ id });
      if (!commande) {
        throw new NotFoundException('Commande introuvable');
      }
      // Au lieu de supprimer, marquer comme rejetée
      commande.statut = 'rejetee';
      commande.motif_rejet = 'Commande supprimée par l\'administrateur';
      
      // Enregistrer dans l'historique
      await this.marquerCommandeCommeModifiee(
        commande.id,
        { id: 1 } as User, // ID de l'admin par défaut
        'Statut',
        commande.statut,
        'rejetee'
      );
      
      return this.commandeRepository.save(commande);
    }

  async deleteCommandeDefinitivement(id: number) {
    const commande = await this.commandeRepository.findOneBy({ id });
    if (!commande) {
      throw new NotFoundException('Commande introuvable');
    }
    return this.commandeRepository.remove(commande);
  }
  // commande.service.ts

  async recalculerTotauxCommande(commandeId: number): Promise<void> {
    // Correction: Utiliser 'lignesCommande' au lieu de 'lignes'
    const commande = await this.commandeRepository.findOne({
      where: { id: commandeId },
      relations: ['lignesCommande'], // <-- Correction ici
    });

    if (!commande) {
      throw new NotFoundException(`Commande ${commandeId} non trouvée`);
    }

    let totalHT = 0;

    // Correction: Utiliser commande.lignesCommande au lieu de commande.lignes
    for (const ligne of commande.lignesCommande) {
      const total = Number(ligne.total);
      if (isNaN(total)) {
        throw new BadRequestException(`Total invalide pour la ligne ${ligne.id}`);
      }
      totalHT += total;
    }

    const prixTotalTTC = parseFloat((totalHT * 1.19).toFixed(2));
    
    commande.prix_hors_taxe = parseFloat(totalHT.toFixed(2));
    commande.prix_total_ttc = prixTotalTTC;

    await this.commandeRepository.save(commande);
  }

  async getCommandesRejeteesPourCommercial(commercialId: number): Promise<Commande[]> {
    return this.commandeRepository.find({
      where: {
        commercial: { id: commercialId },
        statut: 'rejetee',
      },
      relations: ['client', 'lignesCommande', 'lignesCommande.produit', 'promotion'],
      order: { dateCreation: 'DESC' },
    });
  }

  }
