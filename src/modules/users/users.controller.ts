// src/modules/user/users.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
  Put,
  ParseIntPipe,
  Request,
  BadRequestException
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { SetRoles } from '../auth/setRoles.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  // ✅ Créer un commercial
  @Post('create-commercial')
  @SetRoles('admin')
  @ApiOperation({ summary: 'Créer un commercial' })
  createCommercial(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createCommercial(createUserDto);
  }

  // ✅ Créer un admin
  @Post('create-admin')
  @SetRoles('admin')
  @ApiOperation({ summary: 'Créer un administrateur' })
  createAdmin(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createAdmin(createUserDto);
  }

  // ✅ Obtenir tous les utilisateurs (avec filtre optionnel par rôle)
  @Get()
  @SetRoles('admin')
  @ApiOperation({ summary: 'Lister les utilisateurs (avec filtre par rôle)' })
  findUsers(@Query('role') role?: string) {
    return this.usersService.findByRole(role);
  }

  // ✅ Activer/Désactiver un utilisateur
  @Put(':id/status')
  @SetRoles('admin')
  @ApiOperation({ summary: 'Activer ou désactiver un utilisateur' })
  toggleUserStatus(@Param('id') id: number,
 @Body() body: { isActive: boolean }) {
    return this.usersService.updateStatus(id, body.isActive);
  }

  // ✅ Endpoint pour que le commercial modifie son propre profil
@Put('profile')
@SetRoles('commercial')
@ApiOperation({ summary: 'Modifier son propre profil (mot de passe/téléphone)' })
async updateProfile(
  @Request() req,
  @Body() dto: UpdateProfileDto
) {
  // Permettre la mise à jour du mot de passe seul ou du téléphone seul
  if (!dto.password && !dto.tel) {
    throw new BadRequestException('Aucune donnée à mettre à jour');
  }

  // Nettoyer les champs undefined/null
  if (dto.tel === null || dto.tel === undefined) {
    delete dto.tel;
  }
  
  if (dto.password === null || dto.password === undefined) {
    delete dto.password;
  }

  return this.usersService.updateOwnProfile(req.user.id, dto);
}

  // ✅ Modifier un utilisateur
 @Put(':id')
  @SetRoles('admin', 'commercial')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    return this.usersService.updateUser(id, updateUserDto, req.user);
  }

  // ✅ Modifier la position (latitude, longitude)
  @Patch(':id/position')
  @SetRoles('admin')
  @ApiOperation({ summary: 'Mettre à jour la position d\'un commercial' })
  updatePosition(
    @Param('id') id: number,
    @Body() body: { latitude: number; longitude: number }
  ) {
    return this.usersService.updatePosition(id, body.latitude, body.longitude);
  }

  // ✅ Obtenir la carte des commerciaux
  @Get('commercials/map')
  @SetRoles('admin')
  @ApiOperation({ summary: 'Obtenir la position de tous les commerciaux' })
  getCommercialsWithPosition() {
    return this.usersService.getAllCommercialsWithPosition();
  }
}
