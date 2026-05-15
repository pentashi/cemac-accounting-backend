export declare class LigneFactureDto {
    numeroProduit: string;
    intitule: string;
    quantite: number;
    prixUnitaireHT: number;
    tauxTVA: number;
}
export declare class RemiseDto {
    type: 'pourcentage' | 'fixe';
    valeur: number;
}
export declare class FactureCalculDto {
    lignes: LigneFactureDto[];
    typeVente: 'service' | 'marchandise';
    remise?: RemiseDto;
    acompte?: number;
}
export declare class CreateFactureDto extends FactureCalculDto {
    clientId: number;
    numeroFacture: string;
    dateCreation: string;
    dateEcheance: string;
    statut?: 'brouillon' | 'envoyee' | 'reglee' | 'impayee';
}
export declare class UpdateFactureDto {
    lignes?: LigneFactureDto[];
    typeVente?: 'service' | 'marchandise';
    remise?: RemiseDto;
    acompte?: number;
    dateEcheance?: string;
    statut?: 'brouillon' | 'envoyee' | 'reglee' | 'impayee';
}
export declare class UpdateFactureStatusDto {
    statut: 'brouillon' | 'envoyee' | 'reglee' | 'impayee';
}
export declare class RegisterInvoicePaymentDto {
    montant: number;
    canal: string;
    datePaiement: string;
    reference?: string;
    note?: string;
    clientId?: number;
}
