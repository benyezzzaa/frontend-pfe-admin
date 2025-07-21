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

  const commande = this.commandeRepository.create({
    numero_commande: dto.numeroCommande,
    commercial: commercial,
    client: { id: dto.clientId },
    statut: 'en_attente',
    estModifieParAdmin: false,
    prix_total_ttc: 0,
    prix_hors_taxe: 0,
    tva: 0,
    promotion: dto.promotionId ? { id: dto.promotionId } : undefined,
  });

  const savedCommande = await this.commandeRepository.save(commande);

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
    

    async deleteCommande(id: number) {
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


  }
