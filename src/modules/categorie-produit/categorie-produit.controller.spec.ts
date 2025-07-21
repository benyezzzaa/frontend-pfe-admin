import { Test, TestingModule } from '@nestjs/testing';
import { CategorieProduitController } from './categorie-produit.controller';

describe('CategorieProduitController', () => {
  let controller: CategorieProduitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategorieProduitController],
    }).compile();

    controller = module.get<CategorieProduitController>(CategorieProduitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
