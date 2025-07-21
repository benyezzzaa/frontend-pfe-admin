// 📁 src/circuit/circuit.controller.ts
import { Controller, Post, Body, UseGuards, Request, Get, Query } from '@nestjs/common';
import { CircuitService } from './circuit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCircuitDto } from './DTO/create-circuit.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SetRoles } from '../auth/setRoles.decorator';

@ApiTags('Circuits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('circuits')
export class CircuitController {
  constructor(private readonly service: CircuitService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un circuit' }) // optionnel mais bien pour Swagger
  async create(@Body() dto: CreateCircuitDto, @Request() req) {
    return this.service.create(dto, req.user);
  }
@Get('me/today')
@SetRoles('commercial')
async getTodayCircuit(@Request() req) {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  return this.service.getCircuitByDate(req.user, dateStr);
}

  @Get()
  async getByDate(@Request() req, @Query('date') date: string) {
    return this.service.getCircuitByDate(req.user, date);
  }
}
