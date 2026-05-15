import { FactureService } from './facture.service';
import { FactureCalculDto } from './facture.dto';
import type { Response } from 'express';
import { AuditLogService } from '../audit/audit-log.service';
export declare class FactureController {
    private readonly factureService;
    private readonly auditLogService;
    constructor(factureService: FactureService, auditLogService: AuditLogService);
    calculer(dto: FactureCalculDto): Promise<{
        sous_total_ht: number;
        montant_remise: number;
        sous_total_apres_remise: number;
        tps: number;
        total_ht_apres_tps: number;
        tva: number;
        total_ttc: number;
        acompte: number;
        solde_a_payer: number;
    }>;
    exportInvoice(id: string, format: "pdf" | "excel" | "csv" | undefined, res: Response, req: any): Promise<Response<any, Record<string, any>>>;
}
