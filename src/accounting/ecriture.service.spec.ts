import { Test, TestingModule } from '@nestjs/testing';
import { EcritureService } from './ecriture.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EcritureComptable } from './ecriture.entity';
import { AuditLogService } from '../audit/audit-log.service';

describe('EcritureService', () => {
  let service: EcritureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EcritureService,
        { provide: getRepositoryToken(EcritureComptable), useValue: {} },
        { provide: AuditLogService, useValue: { log: jest.fn() } },
      ],
    }).compile();
    service = module.get<EcritureService>(EcritureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an accounting entry', async () => {
    const dto = {
      date_ecriture: '2024-06-01',
      libelle: 'Achat',
      compte_numero: '601100',
      compte_intitule: 'Achats',
      debit: 1000,
      credit: 0,
      reference: 'REF001',
      piece: 'piece.pdf',
    };
    service['ecritureRepo'].create = jest.fn().mockReturnValue(dto);
    service['ecritureRepo'].save = jest.fn().mockResolvedValue({ id: 1, ...dto });
    service['auditLogService'].log = jest.fn();
    const result = await service.create(dto);
    expect(result).toMatchObject({ id: 1, ...dto });
    expect(service['auditLogService'].log).toHaveBeenCalledWith(1, 'create_ecriture', 'EcritureComptable', '1', { compte: '601100' });
  });

  it('should update an accounting entry', async () => {
    const updateDto = { libelle: 'Achat modifié' };
    service['ecritureRepo'].update = jest.fn().mockResolvedValue({});
    service['ecritureRepo'].findOneBy = jest.fn().mockResolvedValue({ id: 1, libelle: 'Achat modifié' });
    service['auditLogService'].log = jest.fn();
    const result = await service.update(1, updateDto);
    expect(result).toMatchObject({ id: 1, libelle: 'Achat modifié' });
    expect(service['auditLogService'].log).toHaveBeenCalledWith(1, 'update_ecriture', 'EcritureComptable', '1', { update: updateDto });
  });

  it('should delete an accounting entry', async () => {
    service['ecritureRepo'].delete = jest.fn().mockResolvedValue({ affected: 1 });
    service['auditLogService'].log = jest.fn();
    const result = await service.delete(1);
    expect(result).toMatchObject({ affected: 1 });
    expect(service['auditLogService'].log).toHaveBeenCalledWith(1, 'delete_ecriture', 'EcritureComptable', '1');
  });

  it('should get income statement', async () => {
    const entries = [
      { compte_numero: '700000', debit: 0, credit: 5000 },
      { compte_numero: '600000', debit: 3000, credit: 0 },
    ];
    service['ecritureRepo'].find = jest.fn().mockResolvedValue(entries);
    const result = await service.getIncomeStatement();
    expect(result).toHaveProperty('resultat');
    expect(result.produits).toBeGreaterThanOrEqual(0);
    expect(result.charges).toBeGreaterThanOrEqual(0);
  });

  it('should get balance sheet', async () => {
    const entries = [
      { compte_numero: '100000', debit: 2000, credit: 0 },
      { compte_numero: '400000', debit: 0, credit: 1500 },
    ];
    service['ecritureRepo'].find = jest.fn().mockResolvedValue(entries);
    const result = await service.getBalanceSheet();
    expect(result).toHaveProperty('actif');
    expect(result).toHaveProperty('passif');
    expect(result).toHaveProperty('equilibre');
  });
});
