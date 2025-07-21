import { Controller, Get } from '@nestjs/common';
import { DashboardService } from '../dashboard/dashboard.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats() {
    return this.dashboardService.getStats();
  }

  @Get('ventes-par-commercial')
  async getVentesParCommercial() {
    return this.dashboardService.getVentesParCommercial();
  }

  @Get('ventes-par-categorie')
  async getVentesParCategorie() {
    return this.dashboardService.getVentesParCategorie();
  }

  @Get('ventes-par-mois')
  async getVentesParMois() {
    return this.dashboardService.getVentesParMois();
  }
}
