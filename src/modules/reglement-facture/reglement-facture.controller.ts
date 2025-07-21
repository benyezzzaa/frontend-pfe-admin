// src/modules/reglement-facture/reglement-facture.controller.ts

import { Controller, Get } from '@nestjs/common';
import { ReglementFactureService } from './reglement-facture.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('ReglementFacture')
@Controller('reglement-facture')
export class ReglementFactureController {
  constructor(private readonly reglementFactureService: ReglementFactureService) {}

  @Get()
  findAll() {
    return this.reglementFactureService.findAll();
  }
}
