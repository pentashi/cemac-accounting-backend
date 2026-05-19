"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterInvoicePaymentDto = exports.UpdateFactureStatusDto = exports.UpdateFactureDto = exports.CreateFactureDto = exports.FactureCalculDto = exports.RemiseDto = exports.LigneFactureDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class LigneFactureDto {
    numeroProduit;
    intitule;
    quantite;
    prixUnitaireHT;
    tauxTVA;
}
exports.LigneFactureDto = LigneFactureDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Numéro du produit', example: 'P001' }),
    __metadata("design:type", String)
], LigneFactureDto.prototype, "numeroProduit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Intitulé du produit',
        example: 'Ordinateur portable',
    }),
    __metadata("design:type", String)
], LigneFactureDto.prototype, "intitule", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantité', example: 2 }),
    __metadata("design:type", Number)
], LigneFactureDto.prototype, "quantite", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Prix unitaire HT', example: 250000 }),
    __metadata("design:type", Number)
], LigneFactureDto.prototype, "prixUnitaireHT", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Taux de TVA (%)', example: 19.25 }),
    __metadata("design:type", Number)
], LigneFactureDto.prototype, "tauxTVA", void 0);
class RemiseDto {
    type;
    valeur;
}
exports.RemiseDto = RemiseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Type de remise', example: 'pourcentage' }),
    __metadata("design:type", String)
], RemiseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Valeur de la remise', example: 10 }),
    __metadata("design:type", Number)
], RemiseDto.prototype, "valeur", void 0);
class FactureCalculDto {
    lignes;
    typeVente;
    remise;
    acompte;
}
exports.FactureCalculDto = FactureCalculDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [LigneFactureDto], description: 'Lignes de la facture' }),
    __metadata("design:type", Array)
], FactureCalculDto.prototype, "lignes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Type de vente', example: 'service' }),
    __metadata("design:type", String)
], FactureCalculDto.prototype, "typeVente", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: RemiseDto,
        required: false,
        description: 'Remise appliquée',
    }),
    __metadata("design:type", RemiseDto)
], FactureCalculDto.prototype, "remise", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Acompte versé',
        example: 50000,
        required: false,
    }),
    __metadata("design:type", Number)
], FactureCalculDto.prototype, "acompte", void 0);
class CreateFactureDto extends FactureCalculDto {
    clientId;
    numeroFacture;
    dateCreation;
    dateEcheance;
    statut;
}
exports.CreateFactureDto = CreateFactureDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Client lié à la facture', example: 1 }),
    __metadata("design:type", Number)
], CreateFactureDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Numéro de facture', example: 'FAC-2026-0001' }),
    __metadata("design:type", String)
], CreateFactureDto.prototype, "numeroFacture", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date de création', example: '2026-05-14' }),
    __metadata("design:type", String)
], CreateFactureDto.prototype, "dateCreation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date d’échéance', example: '2026-05-30' }),
    __metadata("design:type", String)
], CreateFactureDto.prototype, "dateEcheance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Statut initial',
        enum: ['brouillon', 'envoyee', 'reglee', 'impayee'],
        required: false,
    }),
    __metadata("design:type", String)
], CreateFactureDto.prototype, "statut", void 0);
class UpdateFactureDto {
    lignes;
    typeVente;
    remise;
    acompte;
    dateEcheance;
    statut;
}
exports.UpdateFactureDto = UpdateFactureDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: [LigneFactureDto] }),
    __metadata("design:type", Array)
], UpdateFactureDto.prototype, "lignes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], UpdateFactureDto.prototype, "typeVente", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: RemiseDto }),
    __metadata("design:type", RemiseDto)
], UpdateFactureDto.prototype, "remise", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Number)
], UpdateFactureDto.prototype, "acompte", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], UpdateFactureDto.prototype, "dateEcheance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        enum: ['brouillon', 'envoyee', 'reglee', 'impayee'],
    }),
    __metadata("design:type", String)
], UpdateFactureDto.prototype, "statut", void 0);
class UpdateFactureStatusDto {
    statut;
}
exports.UpdateFactureStatusDto = UpdateFactureStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['brouillon', 'envoyee', 'reglee', 'impayee'] }),
    __metadata("design:type", String)
], UpdateFactureStatusDto.prototype, "statut", void 0);
class RegisterInvoicePaymentDto {
    montant;
    canal;
    datePaiement;
    reference;
    note;
    clientId;
}
exports.RegisterInvoicePaymentDto = RegisterInvoicePaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Montant payé', example: 250000 }),
    __metadata("design:type", Number)
], RegisterInvoicePaymentDto.prototype, "montant", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Canal de paiement', example: 'virement' }),
    __metadata("design:type", String)
], RegisterInvoicePaymentDto.prototype, "canal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date du paiement', example: '2026-05-14' }),
    __metadata("design:type", String)
], RegisterInvoicePaymentDto.prototype, "datePaiement", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Référence du paiement',
        example: 'TRX-001',
        required: false,
    }),
    __metadata("design:type", String)
], RegisterInvoicePaymentDto.prototype, "reference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Note complémentaire', required: false }),
    __metadata("design:type", String)
], RegisterInvoicePaymentDto.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Client attendu pour contrôle', required: false }),
    __metadata("design:type", Number)
], RegisterInvoicePaymentDto.prototype, "clientId", void 0);
//# sourceMappingURL=facture.dto.js.map