import { Body, Controller, Get, Param, Patch, Put, UseGuards } from '@nestjs/common';
import { LigneCommandeService } from './lignecommande.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { SetRoles } from '../auth/setRoles.decorator';
import { LigneCommandeDto } from './dto/create-ligneCommande.dto';
import { updateLigneCommandeDto } from './dto/update-ligneCommande.dto';

@ApiTags('Lignes de Commande')
@ApiBearerAuth()
@Controller('lignes-commande')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LigneCommandeController {
  constructor(private readonly ligneCommandeService: LigneCommandeService) {}

  @Get()
  @SetRoles('admin')
  @ApiOperation({ summary: 'Voir toutes les lignes de commande (Bande de commande)' })
  @ApiResponse({ status: 200, description: 'Liste des lignes de commande', type: [LigneCommandeDto] })
  async getAllLignesCommande(): Promise<LigneCommandeDto[]> {
    const lignes = await this.ligneCommandeService.getAllLignesCommande();
    
    // Mapper Entity vers DTO
    return lignes.map(ligne => ({
      id: ligne.id,
      numero_commande: ligne.commande?.numero_commande,
      nom_produit: ligne.produit?.nom,
      quantite: ligne.quantite,
      prix_unitaire: ligne.prixUnitaire,
    }));
  }
@Patch(':id')
@SetRoles('admin')
@ApiOperation({ summary: 'Modifier une ligne de commande' })
@ApiResponse({ status: 200, description: 'Ligne modifiée' })
@Put(':id')
async updateLigneCommande(
  @Param('id') id: number,
  @Body() updateDto: updateLigneCommandeDto
) {
  return this.ligneCommandeService.updateLigneCommande(id, updateDto);
}


}
