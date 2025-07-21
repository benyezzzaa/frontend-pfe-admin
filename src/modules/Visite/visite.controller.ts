import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { VisiteService } from './visite.service';
import { CreateVisiteDto } from './dto/create-visite.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { SetRoles } from '../auth/setRoles.decorator';
import { Visite } from './visite.entity';

@ApiTags('Visites')
@ApiBearerAuth()
@Controller('visites')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VisiteController {
  constructor(private readonly visiteService: VisiteService) {}

  @Post()
  @SetRoles('commercial')
  @ApiOperation({ summary: 'Ajouter une visite (Commercial uniquement)' })
  async createVisite(@Body() dto: CreateVisiteDto, @Request() req) {
    return this.visiteService.createVisite(dto, req.user);
  }
@Get('me')
@SetRoles('commercial')
@ApiOperation({ summary: 'Voir mes propres visites' })
getMyVisites(@Request() req) {
  return this.visiteService.getVisitesByCommercial(req.user.id);
}
  @Get()
  @SetRoles('admin')
  @ApiOperation({ summary: 'Voir toutes les visites (Admin uniquement)' })
  async getAllVisites() {
    return this.visiteService.getAllVisites();
  }

 @Get('commercial/:id')
@SetRoles('admin', 'commercial')
@ApiOperation({ summary: 'Voir les visites d’un commercial' })
async getVisitesByCommercial(@Param('id') id: number, @Request() req) {
  // Si le user est commercial, il ne peut voir que ses propres visites
  if (req.user.role === 'commercial' && req.user.id !== Number(id)) {
    throw new ForbiddenException('Vous ne pouvez voir que vos propres visites.');
  }
  return this.visiteService.getVisitesByCommercial(id);
}

  @Delete(':id')
  @SetRoles('admin', 'commercial')
  @ApiOperation({ summary: 'Supprimer une visite (Admin ou propriétaire)' })
  async deleteVisite(@Param('id') id: number, @Request() req) {
    return this.visiteService.deleteVisite(id, req.user);
  }
  @Get('all')
  findAll(): Promise<Visite[]> {
    return this.visiteService.getAllVisites();
  }
}
