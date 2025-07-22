import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  ParseIntPipe,
  Request,
  Delete,
  Put,
  BadRequestException,
} from '@nestjs/common';
import { ObjectifCommercialService } from './objectif-commercial.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { SetRoles } from '../auth/setRoles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateObjectifDto, CreateObjectifGlobalDto } from './DTO/create-objectif.dto';
import { ObjectifCommercial } from './objectif-commercial.entity';


@ApiTags('Objectifs commerciaux')
@ApiBearerAuth()
@Controller('objectifs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ObjectifCommercialController {
  constructor(private readonly objectifService: ObjectifCommercialService) {}

  @Post('global')
  @SetRoles('admin')
  createObjectifGlobal(@Body() dto: CreateObjectifGlobalDto) {
    return this.objectifService.createGlobal(dto);
  }

  @Post()
  @SetRoles('admin')
  create(@Body() dto: CreateObjectifDto) {
    return this.objectifService.create(dto);
  }

 @Get()
@SetRoles('admin', 'commercial')
async findAll() {
  return this.objectifService.findAll(); // ✅ Cette méthode retourne aussi ceux avec commercial = null
} 

  

  @Get('admin/progress')
  @SetRoles('admin')
  getGlobalProgress() {
    return this.objectifService.getProgressForAdmin();
  }

  @Get('admin/progress-montant')
  @SetRoles('admin')
  getGlobalMontantProgress() {
    return this.objectifService.getGlobalMontantProgress();
  }

  @Get('me/progress')
  @SetRoles('commercial')
  getMyProgress(@Request() req) {
    console.log(`🔍 Controller: getMyProgress appelé pour userId: ${req.user.id}`);
    console.log(`👤 Commercial connecté: ${req.user.nom} ${req.user.prenom}`);
    console.log(`🔑 Token: ${req.headers.authorization?.substring(0, 20)}...`);
    return this.objectifService.getObjectifsProgress(req.user.id);
  }

  @Get('debug/all')
  @SetRoles('commercial')
  debugAll(@Request() req) {
    console.log(`🔍 Controller: debugAll appelé pour userId: ${req.user.id}`);
    return this.objectifService.findAll();
  }

  @Get('debug/my-objectifs')
  @SetRoles('commercial')
  debugMyObjectifs(@Request() req) {
    console.log(`🔍 Controller: debugMyObjectifs appelé pour userId: ${req.user.id}`);
    console.log(`👤 Commercial connecté: ${req.user.nom} ${req.user.prenom}`);
    return this.objectifService.getObjectifsProgress(req.user.id);
  }

  @Get('me/sales-by-category')
  @SetRoles('commercial')
  getMySalesByCategory(@Request() req) {
    return this.objectifService.getSalesByCategory(req.user.userId);
  }

  @Get('me/by-year')
  @SetRoles('commercial')
  getMyObjectifs(@Request() req) {
    return this.objectifService.getByCommercialGroupedByYear(req.user.userId);
  }

  @Put(':id')
  @SetRoles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: Partial<ObjectifCommercial>) {
    return this.objectifService.update(id, data);
  }

  @Put(':id/status')
  @SetRoles('admin')
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.objectifService.toggleStatus(id);
  }

  @Delete(':id')
  @SetRoles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.objectifService.remove(id);
  }
}
