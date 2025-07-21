import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { UniteService } from './unite.service';
import { CreateUniteDto } from './dto/CreateUniteDto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Unite')
@ApiBearerAuth() 
@Controller('unite')
export class UniteController {
  constructor(private readonly uniteService: UniteService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une unité' })
  create(@Body() dto: CreateUniteDto) {
    return this.uniteService.create(dto);
  }

  @Get('unites')
  @ApiOperation({ summary: 'Lister toutes les unités (alias)' })
  getAllUnites() {
    return this.uniteService.findAll();
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Activer ou désactiver une unité' })
  toggleStatus(@Param('id') id: number, @Body('isActive') isActive: boolean) {
    return this.uniteService.toggleStatus(id, isActive);
  }

  // Route principale avec recherche et pagination
  @Get()
  @ApiOperation({ summary: 'Lister toutes les unités (avec recherche et pagination)' })
  findAllUnitesFromProduit(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.uniteService.findAll({ search, page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une unité par ID' })
  findOne(@Param('id') id: number) {
    return this.uniteService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour une unité' })
  update(@Param('id') id: number, @Body() dto: CreateUniteDto) {
    return this.uniteService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une unité' })
  delete(@Param('id') id: number) {
    return this.uniteService.delete(id);
  }
}
