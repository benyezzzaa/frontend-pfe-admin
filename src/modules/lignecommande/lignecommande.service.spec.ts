import { Test, TestingModule } from '@nestjs/testing';
import { LigneCommandeService } from './lignecommande.service';

describe('LignecommandeService', () => {
  let service: LigneCommandeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LigneCommandeService],
    }).compile();

    service = module.get<LigneCommandeService>(LigneCommandeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
