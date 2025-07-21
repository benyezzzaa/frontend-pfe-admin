import { Controller, Post, Get, Body } from '@nestjs/common';
import { TypeReglementService } from './type-reglement.service';


@Controller('typereglements')
export class TypeReglementController {
  constructor(private readonly typeReglementService: TypeReglementService) {}

  @Post()
  async createTypeReglement(@Body() body: { nom: string }) {
    return this.typeReglementService.createTypeReglement(body.nom);
  }

  @Get()
  async getAllTypes() {
    return this.typeReglementService.getAllTypes();
  }
}
