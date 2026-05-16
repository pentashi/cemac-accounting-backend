export declare class PaiementFacture {
    id: number;
    factureId: number;
    montant: number;
    canal: string;
    reference?: string;
    note?: string;
    datePaiement: string;
    createdAt: Date;
}
