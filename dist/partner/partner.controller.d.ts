import { PartnerService } from './partner.service';
import { CreateClientDto, CreateFournisseurDto } from './partner.dto';
import type { Response } from 'express';
export declare class PartnerController {
    private readonly partnerService;
    constructor(partnerService: PartnerService);
    createClient(dto: CreateClientDto): Promise<import("./partner.entity").Client>;
    findAllClients(): Promise<import("./partner.entity").Client[]>;
    exportClients(format: "pdf" | "excel" | "csv" | undefined, res: Response, req: any): Promise<Response<any, Record<string, any>>>;
    importClients(file: Express.Multer.File, req: any): Promise<{
        imported: number;
    }>;
    createFournisseur(dto: CreateFournisseurDto): Promise<import("./partner.entity").Fournisseur>;
    findAllFournisseurs(): Promise<import("./partner.entity").Fournisseur[]>;
    exportFournisseurs(format: "pdf" | "excel" | "csv" | undefined, res: Response, req: any): Promise<Response<any, Record<string, any>>>;
    importFournisseurs(file: Express.Multer.File, req: any): Promise<{
        imported: number;
    }>;
}
