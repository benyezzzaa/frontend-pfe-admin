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
  ParseIntPipe
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { SetRoles } from '../auth/setRoles.decorator';

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

  // ✅ Modifier un utilisateur
 @Put(':id')
  @SetRoles('admin')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, updateUserDto);
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
