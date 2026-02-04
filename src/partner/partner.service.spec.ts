import { Test, TestingModule } from '@nestjs/testing';
import { PartnerService } from './partner.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Client, Fournisseur } from './partner.entity';
import { AuditLogService } from '../audit/audit-log.service';

describe('PartnerService', () => {
  let service: PartnerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartnerService,
        { provide: getRepositoryToken(Client), useValue: {} },
        { provide: getRepositoryToken(Fournisseur), useValue: {} },
        { provide: AuditLogService, useValue: { log: jest.fn() } },
      ],
    }).compile();
    service = module.get<PartnerService>(PartnerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a client', async () => {
    const dto = {
      nom: 'ClientTest',
      email: 'client@test.com',
      telephone: '123456789',
      adresse: 'Test Address',
      numero_contribuable: 'C123',
    };
    service['clientRepo'].create = jest.fn().mockReturnValue(dto);
    service['clientRepo'].save = jest.fn().mockResolvedValue({ id: 1, ...dto });
    service['auditLogService'].log = jest.fn();
    const result = await service.createClient(dto);
    expect(result).toMatchObject({ id: 1, ...dto });
    expect(service['auditLogService'].log).toHaveBeenCalledWith(1, 'create_client', 'Client', '1', { name: 'ClientTest' });
  });

  it('should update a client', async () => {
    const updateDto = { nom: 'UpdatedClient' };
    service['clientRepo'].update = jest.fn().mockResolvedValue({});
    service['clientRepo'].findOneBy = jest.fn().mockResolvedValue({ id: 1, nom: 'UpdatedClient' });
    service['auditLogService'].log = jest.fn();
    const result = await service.updateClient(1, updateDto);
    expect(result).toMatchObject({ id: 1, nom: 'UpdatedClient' });
    expect(service['auditLogService'].log).toHaveBeenCalledWith(1, 'update_client', 'Client', '1', { update: updateDto });
  });

  it('should delete a client', async () => {
    service['clientRepo'].delete = jest.fn().mockResolvedValue({ affected: 1 });
    service['auditLogService'].log = jest.fn();
    const result = await service.deleteClient(1);
    expect(result).toMatchObject({ affected: 1 });
    expect(service['auditLogService'].log).toHaveBeenCalledWith(1, 'delete_client', 'Client', '1');
  });

  it('should create a fournisseur', async () => {
    const dto = {
      nom: 'FournisseurTest',
      email: 'fournisseur@test.com',
      telephone: '987654321',
      adresse: 'Fournisseur Address',
      numero_contribuable: 'F456',
    };
    service['fournisseurRepo'].create = jest.fn().mockReturnValue(dto);
    service['fournisseurRepo'].save = jest.fn().mockResolvedValue({ id: 2, ...dto });
    service['auditLogService'].log = jest.fn();
    const result = await service.createFournisseur(dto);
    expect(result).toMatchObject({ id: 2, ...dto });
    expect(service['auditLogService'].log).toHaveBeenCalledWith(2, 'create_fournisseur', 'Fournisseur', '2', { name: 'FournisseurTest' });
  });

  it('should update a fournisseur', async () => {
    const updateDto = { nom: 'UpdatedFournisseur' };
    service['fournisseurRepo'].update = jest.fn().mockResolvedValue({});
    service['fournisseurRepo'].findOneBy = jest.fn().mockResolvedValue({ id: 2, nom: 'UpdatedFournisseur' });
    service['auditLogService'].log = jest.fn();
    const result = await service.updateFournisseur(2, updateDto);
    expect(result).toMatchObject({ id: 2, nom: 'UpdatedFournisseur' });
    expect(service['auditLogService'].log).toHaveBeenCalledWith(2, 'update_fournisseur', 'Fournisseur', '2', { update: updateDto });
  });

  it('should delete a fournisseur', async () => {
    service['fournisseurRepo'].delete = jest.fn().mockResolvedValue({ affected: 1 });
    service['auditLogService'].log = jest.fn();
    const result = await service.deleteFournisseur(2);
    expect(result).toMatchObject({ affected: 1 });
    expect(service['auditLogService'].log).toHaveBeenCalledWith(2, 'delete_fournisseur', 'Fournisseur', '2');
  });
});
