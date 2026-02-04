export declare class AuditLog {
    id: number;
    userId: number;
    action: string;
    entity: string;
    entityId: string;
    details: any;
    createdAt: Date;
}
