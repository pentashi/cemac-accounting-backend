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
