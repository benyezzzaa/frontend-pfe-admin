import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { CreateClientDto } from './DTO/create-client.dto';
import { User } from '../users/users.entity';
import { Visite } from '../Visite/visite.entity';
import { CategorieClient } from './categorie-client.entity';


@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(Visite)
    private visiteRepository: Repository<Visite>,
    @InjectRepository(CategorieClient)
  private categorieClientRepository: Repository<CategorieClient>,
  ) {}

  // ✅ Validation SIRET (algorithme de Luhn modifié)
  private validateSIRET(siret: string): boolean {
    if (!siret || siret.length !== 14) return false;
    
    let sum = 0;
    for (let i = 0; i < 13; i++) {
      let digit = parseInt(siret[i]);
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === parseInt(siret[13]);
  }

  // ✅ Ajouter un client
  async createClient(dto: CreateClientDto, user: User): Promise<Client> {
    if (user.role !== 'commercial') {
      throw new ForbiddenException('Seuls les commerciaux peuvent ajouter des clients.');
    }

    // Validation SIRET simple (14 chiffres)
    if (dto.codeFiscale && !/^\d{14}$/.test(dto.codeFiscale)) {
      throw new BadRequestException('Le SIRET doit contenir exactement 14 chiffres.');
    }

    let categorie: CategorieClient | null = null;
    if (dto.categorieId) {
      categorie = await this.categorieClientRepository.findOneBy({ id: dto.categorieId });
      if (!categorie) throw new NotFoundException('Catégorie non trouvée');
    }

    // Nettoyer le numéro de téléphone des espaces
    const cleanTelephone = dto.telephone ? dto.telephone.replace(/\s+/g, '') : dto.telephone;

    const client = this.clientRepository.create({
      ...dto,
      telephone: cleanTelephone,
      commercial: user,
      ...(categorie ? { categorie } : {}),
    });

    const savedClient = await this.clientRepository.save(client);

    const clientWithRelations = await this.clientRepository.findOne({
      where: { id: savedClient.id },
      relations: ['categorie', 'commercial'],
    });
    if (!clientWithRelations) throw new NotFoundException('Client non trouvé après création');
    return clientWithRelations;
  }

  // ✅ Voir tous les clients
  async getAllClients(): Promise<Client[]> {
    return this.clientRepository.find({
      relations: ['categorie', 'commercial'],
    });
  }

  // ✅ Voir un client spécifique
  async getClientById(id: number): Promise<Client> {
    if (typeof id !== 'number' || isNaN(id)) {
      throw new BadRequestException('ID invalide');
    }

    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['categorie', 'commercial'],
    });

    if (!client) {
      throw new NotFoundException(`Client avec l'id ${id} non trouvé.`);
    }

    return client;
  }

  // ✅ Modifier un client
  async updateClient(
    id: number,
    dto: CreateClientDto,
    user: User,
  ): Promise<Client> {
    const client = await this.getClientById(id);

    if (user.role === 'commercial' && client.commercial?.id !== user.id) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres clients.');
    }

    // Validation SIRET simple (14 chiffres)
    if (dto.codeFiscale && !/^\d{14}$/.test(dto.codeFiscale)) {
      throw new BadRequestException('Le SIRET doit contenir exactement 14 chiffres.');
    }

    // ✅ Vérifier si le SIRET existe déjà (sauf pour le client actuel)
    if (dto.codeFiscale && dto.codeFiscale !== client.codeFiscale) {
      const existingClient = await this.clientRepository.findOneBy({ 
        codeFiscale: dto.codeFiscale 
      });
      if (existingClient) {
        throw new ConflictException('Un client avec ce numéro SIRET existe déjà.');
      }
    }

    // Nettoyer le numéro de téléphone des espaces
    if (dto.telephone) {
      dto.telephone = dto.telephone.replace(/\s+/g, '');
    }

    // Gérer la mise à jour de la catégorie
    if (dto.categorieId) {
      const categorie = await this.categorieClientRepository.findOneBy({ id: dto.categorieId });
      if (!categorie) {
        throw new NotFoundException('Catégorie non trouvée');
      }
      client.categorie = categorie;
    }

    // Mettre à jour les autres propriétés
    Object.assign(client, {
      nom: dto.nom,
      prenom: dto.prenom,
      email: dto.email,
      telephone: dto.telephone,
      adresse: dto.adresse,
      codeFiscale: dto.codeFiscale,
      estFidele: dto.estFidele,
      latitude: dto.latitude,
      longitude: dto.longitude,
      responsable: dto.responsable,
    });

    const savedClient = await this.clientRepository.save(client);

    // Retourner le client avec les relations chargées
    const clientFinal = await this.clientRepository.findOne({
      where: { id: savedClient.id },
      relations: ['categorie', 'commercial'],
    });

    if (!clientFinal) {
      throw new NotFoundException('Client non trouvé après mise à jour');
    }

    return clientFinal;
  }

  // ✅ Supprimer un client
  async deleteClient(id: number, user: User): Promise<{ message: string }> {
    const client = await this.clientRepository.findOne({ where: { id } });
    if (!client) throw new NotFoundException('Client non trouvé.');

    if (user.role === 'commercial' && client.commercial?.id !== user.id) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres clients.');
    }

    await this.clientRepository.remove(client);
    return { message: 'Client supprimé avec succès.' };
  }

  // ✅ Activer/Désactiver un client
  async updateClientStatus(
    id: number,
    isActive: boolean,
    user: User,
  ): Promise<{ message: string; client: Client }> {
    const client = await this.getClientById(id);

    if (user.role === 'commercial' && client.commercial?.id !== user.id) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres clients.');
    }

    client.isActive = isActive;
    const updated = await this.clientRepository.save(client);

    return {
      message: `Client ${isActive ? 'activé' : 'désactivé'} avec succès.`,
      client: updated,
    };
  }
async getCategoriesDuCommercial(user: User): Promise<CategorieClient[]> {
  if (user.role !== 'commercial') {
    throw new ForbiddenException('Seuls les commerciaux peuvent accéder à leurs catégories');
  }

  const categories = await this.categorieClientRepository
    .createQueryBuilder('categorie')
    .leftJoin('categorie.clients', 'client')
    .where('client.commercial_id = :id', { id: user.id })
    .groupBy('categorie.id')
    .addGroupBy('categorie.nom')
    .getMany();

  return categories;
}
  // ✅ Récupérer les clients d'un commercial
  async getClientsDuCommercial(user: User): Promise<Client[]> {
    if (!user || !user.id) {
      throw new BadRequestException('Utilisateur non authentifié');
    }

    return this.clientRepository.find({
      where: { commercial: { id: user.id } },
      relations: ['categorie', 'commercial'],
    });
  }

  // ✅ Récupérer les clients d'un commercial (pour l'admin)
  async getClientsByCommercialId(commercialId: number): Promise<Client[]> {
    return this.clientRepository.find({
      where: { commercial: { id: commercialId } },
      relations: ['categorie', 'commercial'],
    });
  }

  // ✅ Tournée optimisée
  async getOptimizedPlanning(user: User, currentLat: number, currentLon: number) {
    if (!user || !user.id) {
      throw new BadRequestException('Utilisateur non authentifié.');
    }

    const clients = await this.clientRepository.find({
      where: { commercial: { id: user.id }, isActive: true },
      relations: ['commercial'],
    });

    if (!clients.length) {
      return [];
    }

    // Visites de ces clients uniquement
    const visites = await this.visiteRepository
      .createQueryBuilder('visite')
      .leftJoinAndSelect('visite.client', 'client')
      .where('client.commercial_id = :commercialId', { commercialId: user.id })
      .getMany();

    const now = new Date();

    const scoredClients = clients.map(client => {
      const lastVisit = visites
        .filter(v => v.client.id === client.id)
        .sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime(),
        )[0];

      const daysSinceLastVisit = lastVisit
        ? Math.ceil(
            (now.getTime() - new Date(lastVisit.date).getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : 999;

      const distance =
        client.latitude != null && client.longitude != null
          ? haversine(currentLat, currentLon, client.latitude, client.longitude)
          : 999;

      const score =
        5 * client.importance + 0.1 * daysSinceLastVisit - 2 * distance;

      return {
        id: client.id,
        nom: client.nom,
        prenom: client.prenom,
        adresse: client.adresse,
        importance: client.importance,
        distance: Number(distance.toFixed(2)),
        daysSinceLastVisit,
        score: Number(score.toFixed(2)),
      };
    });

    return scoredClients.sort((a, b) => b.score - a.score);
  }
}

// ✅ Fonction haversine en dehors de la classe
function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
