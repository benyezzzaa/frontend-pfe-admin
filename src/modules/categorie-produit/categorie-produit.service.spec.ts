import { Test, TestingModule } from '@nestjs/testing';
import { CategorieProduitService } from './categorie-produit.service';

describe('CategorieProduitService', () => {
  let service: CategorieProduitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategorieProduitService],
    }).compile();

    service = module.get<CategorieProduitService>(CategorieProduitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
