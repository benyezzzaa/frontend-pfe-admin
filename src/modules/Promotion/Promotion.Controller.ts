import {
    Controller,
    Post,
    Get,
    Patch,
    Param,
    Body,
    UseGuards,
    ParseIntPipe,
    Request,
    Put,
  } from '@nestjs/common';
 

  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { RolesGuard } from '../auth/roles.guard';
  import { SetRoles } from '../auth/setRoles.decorator';
  import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreatePromotionDto } from './DTO/CreatePromotionDto.dto';
import { PromotionService } from './Promotion.Service';
  
  @ApiTags('Promotions')
  @ApiBearerAuth()
  @Controller('promotions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class PromotionController {
    constructor(private readonly promoService: PromotionService) {}
    // ✅ Dans PromotionController

    @Post()
    @SetRoles('admin')
    create(@Body() dto: CreatePromotionDto) {
      return this.promoService.create(dto);
    }
@Get('commercial/actives')
@UseGuards(JwtAuthGuard, RolesGuard)
@SetRoles('commercial')
findActivePromotionsForCommercial() {
  return this.promoService.findActives();
}
 @Get()
@SetRoles('admin', 'commercial')
findAll(@Request() req) {
  console.log('👤 Role:', req.user.role); // ➕ debug
  return this.promoService.findAll(); // temporairement sans filtrage
}
   @Get('actives')
  @SetRoles('admin', 'commercial')
  getActives() {
    return this.promoService.getPromotionsActives();
  }
    @Put()
    @SetRoles('admin')
    updateFromBody(@Body() dto: CreatePromotionDto & { id: number }) {
      return this.promoService.update(dto.id, dto);
    }
  
    @Put(':id/status')
    @SetRoles('admin')
    toggleStatus(@Param('id', ParseIntPipe) id: number) {
      return this.promoService.toggleStatus(id);
    }
  }
  