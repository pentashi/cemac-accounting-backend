import { Repository } from 'typeorm';
import { EcritureComptable } from '../accounting/ecriture.entity';
export declare class ReportingService {
    private ecritureRepo;
    constructor(ecritureRepo: Repository<EcritureComptable>);
    getSalesStats(): Promise<{
        totalVentes: number;
    }>;
    getPurchasesStats(): Promise<{
        totalAchats: number;
    }>;
    getPerformanceIndicators(): Promise<{
        marge: number;
        totalAchats: number;
        totalVentes: number;
    }>;
}
