import { AuditLogService } from '../audit/audit-log.service';
import { Repository } from 'typeorm';
import { Client, Fournisseur } from './partner.entity';
import { CreateClientDto, CreateFournisseurDto } from './partner.dto';
export declare class PartnerService {
    private clientRepo;
    private fournisseurRepo;
    private readonly auditLogService;
    constructor(clientRepo: Repository<Client>, fournisseurRepo: Repository<Fournisseur>, auditLogService: AuditLogService);
    createClient(dto: CreateClientDto): Promise<Client>;
    findAllClients(): Promise<Client[]>;
    findClientById(id: number): Promise<Client>;
    exportClients(format: 'pdf' | 'excel' | 'csv', userId: number): Promise<{
        buffer: Buffer<ArrayBufferLike>;
        filename: string;
        contentType: string;
    }>;
    importClients(file: Express.Multer.File, userId: number): Promise<{
        imported: number;
    }>;
    updateClient(id: number, dto: Partial<CreateClientDto>): Promise<Client>;
    deleteClient(id: number): Promise<import("typeorm").DeleteResult>;
    createFournisseur(dto: CreateFournisseurDto): Promise<Fournisseur>;
    findAllFournisseurs(): Promise<Fournisseur[]>;
    findFournisseurById(id: number): Promise<Fournisseur>;
    exportFournisseurs(format: 'pdf' | 'excel' | 'csv', userId: number): Promise<{
        buffer: Buffer<ArrayBufferLike>;
        filename: string;
        contentType: string;
    }>;
    importFournisseurs(file: Express.Multer.File, userId: number): Promise<{
        imported: number;
    }>;
    updateFournisseur(id: number, dto: Partial<CreateFournisseurDto>): Promise<Fournisseur>;
    deleteFournisseur(id: number): Promise<import("typeorm").DeleteResult>;
}
