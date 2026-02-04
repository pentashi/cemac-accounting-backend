import { AuditLogService } from '../audit/audit-log.service';
import { Repository } from 'typeorm';
import { EcritureComptable } from './ecriture.entity';
import { CreateEcritureDto } from './ecriture.dto';
export declare class EcritureService {
    private ecritureRepo;
    private readonly auditLogService;
    constructor(ecritureRepo: Repository<EcritureComptable>, auditLogService: AuditLogService);
    exportEntries(format: 'pdf' | 'excel' | 'csv'): Promise<{
        buffer: Buffer;
        filename: string;
        contentType: string;
    }>;
    importEntries(file: any, userId: number): Promise<{
        imported: number;
    }>;
    create(dto: CreateEcritureDto): Promise<EcritureComptable>;
    getIncomeStatement(): Promise<{
        produits: number;
        charges: number;
        resultat: number;
    }>;
    getBalanceSheet(): Promise<{
        actif: number;
        passif: number;
        equilibre: boolean;
    }>;
    getBalance(): Promise<{
        compte_intitule: string;
        debit: number;
        credit: number;
        solde: number;
        compte_numero: string;
    }[]>;
    findAll(): Promise<EcritureComptable[]>;
    update(id: number, dto: Partial<CreateEcritureDto>): Promise<EcritureComptable | null>;
    delete(id: number): Promise<import("typeorm").DeleteResult>;
    findByDateRange(start: string, end: string): Promise<EcritureComptable[]>;
    findByAccount(compte_numero: string): Promise<EcritureComptable[]>;
    findByType(type: 'vente' | 'achat'): Promise<EcritureComptable[]>;
}
