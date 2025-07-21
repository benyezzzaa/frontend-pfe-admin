import { Controller, Post, Get, Body, UseGuards, Request, Put, Patch, Param } from '@nestjs/common';
import { CategorieClientService } from './categorie-client.service';
import { CreateCategorieClientDto } from './DTO/create-categorie-client.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { SetRoles } from '../auth/setRoles.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { UpdateCategorieStatusDto } from './DTO/update-categorie-status.dto';

@ApiBearerAuth()
@ApiTags('categorie-client')
@Controller('categorie-client')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategorieClientController {
  constructor(private readonly categorieService: CategorieClientService) {}

  @Post()
  @SetRoles('admin')
  @ApiOperation({ summary: 'Ajouter une catégorie (admin uniquement)' })
  createCategorie(@Body() dto: CreateCategorieClientDto, @Request() req) {
    return this.categorieService.create(dto);
  }

  @Get()
  @SetRoles('admin', 'commercial')
  @ApiOperation({ summary: 'Lister toutes les catégories (admin et commercial)' })
  getAll() {
    return this.categorieService.findAll();
  }

  @Put(':id')
  @SetRoles('admin')
  @ApiOperation({ summary: 'Modifier une catégorie (admin uniquement)' })
  updateCategorie(@Param('id') id: number, @Body() dto: CreateCategorieClientDto) {
    return this.categorieService.update(id, dto);
  }

  @Put(':id/status')
  @SetRoles('admin')
  @ApiOperation({ summary: 'Activer/désactiver une catégorie (PUT)' })
  updateStatusPut(
    @Param('id') id: number,
    @Body() body: UpdateCategorieStatusDto
  ) {
    console.log('BODY PUT statut catégorie:', body);
    return this.categorieService.updateStatus(id, body.isActive);
  }

 
}