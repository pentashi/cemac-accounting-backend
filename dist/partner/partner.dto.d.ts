export declare class CreateClientDto {
    nom: string;
    email: string;
    telephone: string;
    adresse: string;
    numero_contribuable?: string;
}
export declare class UpdateClientDto extends CreateClientDto {
}
export declare class CreateFournisseurDto {
    nom: string;
    email: string;
    telephone: string;
    adresse: string;
    numero_contribuable?: string;
}
export declare class UpdateFournisseurDto extends CreateFournisseurDto {
}
