import { Controller, Get, Post, Body, Param, Delete, NotFoundException } from '@nestjs/common';
import { FactureService } from './facture.service';
import { Facture } from './facture.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Factures')
@Controller('factures')
export class FactureController {
  constructor(private readonly factureService: FactureService) {}

  @Get()
  async getAllFactures(): Promise<Facture[]> {
    return this.factureService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: number): Promise<Facture> {
    const facture = await this.factureService.findById(id);
    if (!facture) {
      throw new NotFoundException('Facture non trouvée');
    }
    return facture;
  }

  @Post()
  async createFacture(@Body() factureData: Partial<Facture>): Promise<Facture> {
    return this.factureService.create(factureData);
  }

  @Delete(':id')
  async deleteFacture(@Param('id') id: number): Promise<void> {
    return this.factureService.delete(id);
  }
}
