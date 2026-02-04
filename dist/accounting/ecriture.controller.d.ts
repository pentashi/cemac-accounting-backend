import { EcritureService } from './ecriture.service';
import { CreateEcritureDto } from './ecriture.dto';
import type { Response } from 'express';
import { AuditLogService } from '../audit/audit-log.service';
export declare class EcritureController {
    private readonly ecritureService;
    private readonly auditLogService;
    constructor(ecritureService: EcritureService, auditLogService: AuditLogService);
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
    exportEntries(format: "pdf" | "excel" | "csv" | undefined, res: Response, req: any): Promise<Response<any, Record<string, any>>>;
    importEntries(file: any, req: any): Promise<{
        imported: number;
    }>;
    create(dto: CreateEcritureDto): Promise<import("./ecriture.entity").EcritureComptable>;
    findAll(): Promise<import("./ecriture.entity").EcritureComptable[]>;
    findByDateRange(start: string, end: string): Promise<import("./ecriture.entity").EcritureComptable[]>;
    findByAccount(compte_numero: string): Promise<import("./ecriture.entity").EcritureComptable[]>;
    findByType(type: 'vente' | 'achat'): Promise<import("./ecriture.entity").EcritureComptable[]>;
}
