import {
  Controller, Post, Get, Body, Param, Patch, Request, UseGuards,
  Put
} from '@nestjs/common';
import { ReclamationService } from './reclamation.service';
import { CreateReclamationDto } from './DTO/create-reclamation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { SetRoles } from '../auth/setRoles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth()
@Controller('reclamations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReclamationController {
  constructor(private service: ReclamationService) {}
@Get('ouvertes')
@SetRoles('admin')
findOpen() {
  return this.service.findOpenReclamations();
}

   @Post()
  @SetRoles('commercial')
  create(@Body() dto: CreateReclamationDto, @Request() req) {
    return this.service.create(dto, req.user);
  }

  @Get()
  @SetRoles('admin')
  findAll() {
    return this.service.findAll();
  }

  @Get('me')
  @SetRoles('commercial')
  findByUser(@Request() req) {
    return this.service.findByUser(req.user.id);
  }

  @Put(':id/status')
  @SetRoles('admin')
  updateStatus(@Param('id') id: number, @Body('status') status: string) {
    return this.service.updateStatus(id, status);
  }
}
