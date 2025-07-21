  import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { LigneCommande } from './lignecommande.entity';
  import { updateLigneCommandeDto } from './dto/update-ligneCommande.dto';
  import { CommandeService } from '../commande/commande.service';

  @Injectable()
  export class LigneCommandeService {
    constructor(
      @InjectRepository(LigneCommande)
      private ligneCommandeRepository: Repository<LigneCommande>,
      private commandeService: CommandeService
      
    ) {}

    async getAllLignesCommande(): Promise<LigneCommande[]> {
      return this.ligneCommandeRepository.find({ relations: ['commande', 'produit'] });
    }
  // lignecommande.service.ts

  async updateLigneCommande(id: number, updateDto: updateLigneCommandeDto): Promise<LigneCommande> {
    const ligne = await this.ligneCommandeRepository.findOne({
      where: { id },
      relations: ['produit', 'commande'],
    });

    if (!ligne) {
      throw new NotFoundException(`Ligne de commande ${id} non trouvée`);
    }

    // Validation améliorée
    if (updateDto.prix_unitaire === undefined) {
      throw new BadRequestException('Prix unitaire requis');
    }

    if (updateDto.quantite === undefined) {
      throw new BadRequestException('Quantité requise');
    }

    const prixUnitaire = Number(updateDto.prix_unitaire);
    const quantite = Number(updateDto.quantite);

    if (isNaN(prixUnitaire) || prixUnitaire <= 0) {
      throw new BadRequestException('Prix unitaire invalide');
    }

    if (isNaN(quantite) || quantite <= 0 || !Number.isInteger(quantite)) {
      throw new BadRequestException('Quantité invalide');
    }

    // Mise à jour
    ligne.prixUnitaireTTC = prixUnitaire;
    ligne.quantite = quantite;
    ligne.total = prixUnitaire * quantite;

    await this.ligneCommandeRepository.save(ligne);
    await this.commandeService.recalculerTotauxCommande(ligne.commande.id);

    return ligne;
  }


  }
