import { Facture } from './facture.entity';
import { LigneFacture } from './ligne-facture.entity';
import { Repository } from 'typeorm';
import { AuditLogService } from '../audit/audit-log.service';
import { NotificationService } from '../notification/notification.service';
import { FactureCalculDto } from './facture.dto';
export declare class FactureService {
    private readonly factureRepo;
    private readonly ligneFactureRepo;
    private readonly auditLogService;
    private readonly notificationService;
    constructor(factureRepo: Repository<Facture>, ligneFactureRepo: Repository<LigneFacture>, auditLogService: AuditLogService, notificationService: NotificationService);
    exportInvoice(id: number, format: 'pdf' | 'excel' | 'csv'): Promise<{
        buffer: Buffer;
        filename: string;
        contentType: string;
    }>;
    calculerFacture(dto: FactureCalculDto, userId?: number): Promise<{
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
    updateFacture(id: number, dto: any, userId: number): Promise<any>;
    deleteFacture(id: number, userId: number): Promise<{
        id: number;
        deleted: boolean;
    }>;
}
