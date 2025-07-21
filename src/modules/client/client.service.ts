import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
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

  // ✅ Ajouter un client
  async createClient(dto: CreateClientDto, user: User): Promise<Client> {
    if (user.role !== 'commercial') {
      throw new ForbiddenException('Seuls les commerciaux peuvent ajouter des clients.');
    }

    let categorie: CategorieClient | null = null;
    if (dto.categorieId) {
      categorie = await this.categorieClientRepository.findOneBy({ id: dto.categorieId });
      if (!categorie) throw new NotFoundException('Catégorie non trouvée');
    }

    const client = this.clientRepository.create({
      ...dto,
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
    return this.clientRepository.find();
  }

  // ✅ Voir un client spécifique
  async getClientById(id: number): Promise<Client> {
    if (typeof id !== 'number' || isNaN(id)) {
      throw new BadRequestException('ID invalide');
    }

    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['commercial'],
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

    Object.assign(client, dto);
    return this.clientRepository.save(client);
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
      relations: ['commercial'],
    });
  }

  // ✅ Récupérer les clients d'un commercial (pour l'admin)
  async getClientsByCommercialId(commercialId: number): Promise<Client[]> {
    return this.clientRepository.find({
      where: { commercial: { id: commercialId } },
      relations: ['commercial'],
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
