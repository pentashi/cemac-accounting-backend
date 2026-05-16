export declare class Facture {
    id: number;
    numero_facture: string;
    date_creation: string;
    date_echeance: string;
    client_id: number;
    type_vente: 'service' | 'marchandise';
    sous_total_ht: number;
    montant_remise: number;
    tps: number;
    tva: number;
    total_ttc: number;
    acompte: number;
    statut: 'brouillon' | 'envoyee' | 'reglee' | 'impayee';
}
