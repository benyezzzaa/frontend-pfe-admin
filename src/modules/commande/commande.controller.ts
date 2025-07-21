import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  UseGuards,
  Delete,
  Param,
  Patch,
  Req,
  Put,
  Res,
} from '@nestjs/common';
import { CommandeService } from './commande.service';
import { CreateCommandeDto } from './dto/create-commande.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { SetRoles } from '../auth/setRoles.decorator';
import { UpdateCommandeDto } from './dto/update-commande.dto';
import { Response } from 'express';

@ApiTags('Commandes')
@ApiBearerAuth()
@Controller('commandes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommandeController {
  constructor(private readonly commandeService: CommandeService) {}

  @Post()
  async createCommande(@Body() dto: CreateCommandeDto, @Request() req) {
    return this.commandeService.createCommande(dto, req.user);
  }

  @Get()
  @SetRoles('admin', 'commercial')
  @ApiOperation({ summary: 'Voir toutes les commandes' })
  async getAllCommandes() {
    return this.commandeService.getAllCommandes();
  }

  @Get('me')
  @SetRoles('commercial')
  async getMyCommandes(@Req() req) {
    return this.commandeService.findAllByCommercial(req.user.id);
  }

@Put(':id')
@SetRoles('admin')
@ApiOperation({ summary: 'Modifier une commande (admin)' })
async updateCommande(
  @Param('id') id: number,
  @Body() dto: UpdateCommandeDto,
) {
  console.log('REÇU:', dto);
  return this.commandeService.updateCommande(id, dto);
}

  @Put('valider/:id')
  @SetRoles('admin')
  validerCommande(@Param('id') id: number) {
    return this.commandeService.validerCommande(+id);
  }

  @Delete(':id')
  @SetRoles('admin')
  async deleteCommande(@Param('id') id: number) {
    return this.commandeService.deleteCommande(id);
  }

  @Get('bande/:id')
  @SetRoles('admin', 'commercial')
  async getBandeDeCommande(@Param('id') id: number) {
    return this.commandeService.getBandeDeCommande(id);
  }

  @Get('validees')
  @SetRoles('admin', 'commercial')
  async getCommandesValidees() {
    return this.commandeService.getCommandesValidees();
  }

  @Get('pdf/:id')
  async downloadPdf(@Param('id') id: number, @Res() res: Response) {
    const pdfBuffer = await this.commandeService.generatePdf(+id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="commande_${id}.pdf"`,
    });
    res.send(pdfBuffer);
  }

  // ✅ Notifications commerciales

  @Get('modifiees')
  @SetRoles('commercial')
  @ApiOperation({ summary: 'Récupérer les commandes modifiées par l\'admin' })
  async getCommandesModifiees(@Req() req) {
    return this.commandeService.getCommandesModifieesPourCommercial(req.user.id);
  }

 @Get('modifiees/details/:id')
@SetRoles('commercial')
@ApiOperation({ summary: 'Récupérer les détails d\'une commande modifiée' })
async getDetailsCommandeModifiee(@Param('id') id: number) {
  return this.commandeService.getDetailsCommandeModifiee(id); // ✅ un seul paramètre attendu
}

 @Put('notifications/:id/vu')
@SetRoles('commercial')
@ApiOperation({ summary: 'Marquer une notification comme vue' })
async marquerNotificationCommeVue(@Param('id') id: number) {
  return this.commandeService.getNombreNotificationsNonVues(id); // ✅ un seul paramètre attendu
}
@Get('notifications')
@SetRoles('commercial')
@ApiOperation({ summary: 'Nombre de notifications non vues pour un commercial' })
async getNombreNotificationsNonVues(@Req() req) {
  return this.commandeService.getNombreNotificationsNonVues(req.user.id); // ✅ 1 seul argument
}
 
}