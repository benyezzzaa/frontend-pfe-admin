import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ReglementService } from './reglement.service';
import { CreateReglementDto } from './dto/create-reglement.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Reglements')
@Controller('reglements')
export class ReglementController {
  constructor(private readonly reglementService: ReglementService) {}

  @Post()
  async create(@Body() dto: CreateReglementDto) {
    return this.reglementService.create(dto); // ✅ ici c'est create() pas createReglement()
  }

  @Get()
  async findAll() {
    return this.reglementService.findAll(); // ✅ ici c'est findAll() pas getReglements()
  }
}
