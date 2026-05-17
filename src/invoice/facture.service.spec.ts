import { Test, TestingModule } from '@nestjs/testing';
import { FactureService } from './facture.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Facture } from './facture.entity';
import { LigneFacture } from './ligne-facture.entity';
import { PaiementFacture } from './paiement-facture.entity';
import { AuditLogService } from '../audit/audit-log.service';
import { NotificationService } from '../notification/notification.service';

describe('FactureService', () => {
  let service: FactureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FactureService,
        { provide: getRepositoryToken(Facture), useValue: {} },
        { provide: getRepositoryToken(LigneFacture), useValue: {} },
        { provide: getRepositoryToken(PaiementFacture), useValue: {} },
        { provide: AuditLogService, useValue: { log: jest.fn() } },
        { provide: NotificationService, useValue: { create: jest.fn() } },
      ],
    }).compile();
    service = module.get<FactureService>(FactureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate a facture', async () => {
    const dto = {
      lignes: [
        { numeroProduit: 'P001', intitule: 'Produit 1', quantite: 2, prixUnitaireHT: 1000, tauxTVA: 19.25 },
        { numeroProduit: 'P002', intitule: 'Produit 2', quantite: 1, prixUnitaireHT: 2000, tauxTVA: 19.25 },
      ],
      typeVente: 'service',
      remise: { type: 'pourcentage', valeur: 10 },
      acompte: 500,
    };
    service['auditLogService'].log = jest.fn();
    service['notificationService'].create = jest.fn();
    const result = await service.calculerFacture(dto, 1);
    expect(result).toHaveProperty('total_ttc');
    expect(service['auditLogService'].log).toHaveBeenCalledWith(
      1,
      'calcul_facture',
      'Facture',
      undefined,
      expect.objectContaining({ lignes: 2, total_ttc: result.total_ttc })
    );
    expect(service['notificationService'].create).toHaveBeenCalledWith(
      1,
      'facture_calculated',
      expect.stringContaining('Montant TTC')
    );
  });

  it('should update a facture', async () => {
    const mockFacture = { id: 1, montant: 1000, lignes: [], montant_paye: 0, total_ttc: 1000, type_vente: 'service', date_echeance: null, statut: 'brouillon' };
    service['factureRepo'].findOneBy = jest.fn().mockResolvedValue(mockFacture);
    service['ligneFactureRepo'].find = jest.fn().mockResolvedValue([]);
    service['paiementFactureRepo'].find = jest.fn().mockResolvedValue([]);
    service['factureRepo'].update = jest.fn().mockResolvedValue({});
    service['auditLogService'].log = jest.fn();
    const result = await service.updateFacture(1, { montant: 1000 }, 2);
    expect(result).toMatchObject({ id: 1, montant: 1000 });
    expect(service['auditLogService'].log).toHaveBeenCalledWith(2, 'update_facture', 'Facture', '1', { update: { montant: 1000 } });
  });

  it('should delete a facture', async () => {
    const mockFacture = { id: 1, lignes: [], paiements: [] };
    service['factureRepo'].findOneBy = jest.fn().mockResolvedValue(mockFacture);
    service['ligneFactureRepo'].find = jest.fn().mockResolvedValue([]);
    service['paiementFactureRepo'].find = jest.fn().mockResolvedValue([]);
    service['ligneFactureRepo'].delete = jest.fn().mockResolvedValue({});
    service['paiementFactureRepo'].delete = jest.fn().mockResolvedValue({});
    service['factureRepo'].delete = jest.fn().mockResolvedValue({});
    service['auditLogService'].log = jest.fn();
    const result = await service.deleteFacture(1, 3);
    expect(result).toMatchObject({ id: 1, deleted: true });
    expect(service['auditLogService'].log).toHaveBeenCalledWith(3, 'delete_facture', 'Facture', '1');
  });
});
