// ✅ CONTROLLER - produit.controller.ts
import {
  Controller, Post, Body, Get, UploadedFiles, UseInterceptors,
  UseGuards, Patch, Param,
  Header,
  Put
} from '@nestjs/common';
import { ProduitService } from './produit.service';
import { CreateProduitDto } from './dto/create-produit.dto';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { SetRoles } from '../auth/setRoles.decorator';
import { File as MulterFile } from 'multer';
import { UpdateProduitDto } from './dto/update-produit.dto';
@ApiTags('Produits')
@Controller('produits')
export class ProduitController {
  constructor(private readonly produitService: ProduitService) {}

  @Post()
  @SetRoles('admin')
  @UseInterceptors(FilesInterceptor('images', 5, {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  @ApiOperation({ summary: 'Ajouter un produit' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nom: { type: 'string' },
        description: { type: 'string' },
        prix: { type: 'number' },
        prix_unitaire: { type: 'number' },
        categorieId: { type: 'string' },
        uniteId: { type: 'number' },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  async createProduit(
    @Body() dto: CreateProduitDto,
    @UploadedFiles() files: MulterFile[],
  ) {
    const imagePaths = files.map(file => `/uploads/${file.filename}`);
    return this.produitService.createProduit(dto, imagePaths);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les produits' })
  async getProduits() {
    return this.produitService.getAllProduits();
  }

  @Post('test-data')
  @ApiOperation({ summary: 'Créer des produits de test' })
  async createTestProducts() {
    return this.produitService.createTestProducts();
  }
 @Put(':id')
@SetRoles('admin')
@UseInterceptors(FilesInterceptor('images', 5, {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      callback(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
    },
  }),
}))
@ApiOperation({ summary: 'Modifier un produit' })
@ApiConsumes('multipart/form-data')
@ApiBody({ /* ... pas besoin de modifier ici si Swagger marche */ })
async updateProduit(
  @Param('id') id: string,
  @Body() dto: UpdateProduitDto,
  @UploadedFiles() files: MulterFile[],
) {
  const imagePaths = files.map(file => `/uploads/${file.filename}`);
  return this.produitService.updateProduit(Number(id), dto, imagePaths);
}
  
  @Put(':id/status')
  @SetRoles('admin')
  @ApiOperation({ summary: 'Activer/Désactiver un produit' })
  @ApiConsumes('application/json')
  async updateStatutProduit(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.produitService.updateStatut(Number(id), body.isActive);
  }
}