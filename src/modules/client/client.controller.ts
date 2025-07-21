import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  Request,
  UseGuards,
  InternalServerErrorException,
  HttpException,
  Options,
  ParseIntPipe,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './DTO/create-client.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { SetRoles } from '../auth/setRoles.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateClientStatusDto } from './DTO/update-client-status.dto';

@ApiTags('client')
@ApiBearerAuth()
@Controller('client')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  // ✅ Ajouter un client
  @UseGuards(JwtAuthGuard, RolesGuard)

  @Post()
  @SetRoles('commercial')
  @ApiOperation({ summary: 'Ajouter un client (Commercial uniquement)' })
  async createClient(@Body() dto: CreateClientDto, @Request() req) {
    return this.clientService.createClient(dto, req.user);
  }
@Get('planning')
@SetRoles('commercial')
@ApiOperation({ summary: 'Obtenir la tournée optimisée des clients' })
async getPlanning(
  @Query('lat') lat: string,
  @Query('lon') lon: string,
  @Request() req
) {
  const parsedLat = parseFloat(lat);
  const parsedLon = parseFloat(lon);

  if (isNaN(parsedLat) || isNaN(parsedLon)) {
    throw new BadRequestException('Latitude et longitude invalides.');
  }

  return this.clientService.getOptimizedPlanning(req.user, parsedLat, parsedLon);
}
@Get('mes-categories')
@SetRoles('commercial')
@ApiOperation({ summary: 'Catégories des clients du commercial connecté' })
async getMesCategories(@Request() req) {
  return this.clientService.getCategoriesDuCommercial(req.user);
}
  // ✅ Voir tous les clients ou filtrer par commercialId
  @Get()
  @SetRoles('admin')
  @ApiOperation({ summary: 'Voir tous les clients ou filtrer par commercial' })
  async getClients(@Query('commercialId') commercialId?: number) {
    if (commercialId) {
      return this.clientService.getClientsByCommercialId(commercialId);
    }
    return this.clientService.getAllClients();
  }
  

  // ✅ Voir MES clients (⚠️ doit être AVANT ':id')
  @Get('mes-clients')
  @SetRoles('commercial')
  @ApiOperation({ summary: 'Récupérer les clients du commercial connecté' })
  async getMesClients(@Request() req) {
    console.log('user:', req.user); // Pour vérifier que req.user est bien là
    return this.clientService.getClientsDuCommercial(req.user);
  }

  // ✅ Voir un client spécifique (⚠️ À placer APRÈS les routes fixes comme 'mes-clients')
  @Get(':id')
  @SetRoles('admin', 'commercial')
  @ApiOperation({ summary: 'Voir un client par ID' })
  getClient(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.getClientById(id);
  }

  // ✅ Modifier un client
  @Put(':id')
  @SetRoles('admin', 'commercial')
  @ApiOperation({ summary: 'Modifier un client' })
  async updateClient(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateClientDto,
    @Request() req,
  ) {
    try {
      return await this.clientService.updateClient(id, dto, req.user);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Erreur interne lors de la mise à jour du client');
    }
  }

  // ✅ Supprimer un client
  @Delete(':id')
  @SetRoles('admin', 'commercial')
  @ApiOperation({ summary: 'Supprimer un client' })
  async deleteClient(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.clientService.deleteClient(id, req.user);
  }

  // ✅ Activer/Désactiver un client
@Put(':id/status')
@SetRoles('admin', 'commercial')
@ApiOperation({ summary: 'Activer ou désactiver un client' })
async updateClientStatus(
  @Param('id', ParseIntPipe) id: number,
  @Body() body: UpdateClientStatusDto,
  @Request() req,
) {
  return this.clientService.updateClientStatus(id, body.isActive, req.user);
}

  // ✅ OPTIONS (utile pour CORS et Swagger parfois)
  @Options(':id/status')
  async optionsClientStatus() {
    return {
      status: 'OK',
      methods: 'PATCH, OPTIONS',
      allowedHeaders: 'Content-Type, Authorization',
    };
  }
}
  