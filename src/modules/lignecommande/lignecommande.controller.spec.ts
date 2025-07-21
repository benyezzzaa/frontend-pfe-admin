import { Test, TestingModule } from '@nestjs/testing';
import { LigneCommandeController } from './lignecommande.controller';

describe('LignecommandeController', () => {
  let controller: LigneCommandeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LigneCommandeController],
    }).compile();

    controller = module.get<LigneCommandeController>(LigneCommandeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
