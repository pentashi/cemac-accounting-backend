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
exports.CreateEcritureDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class CreateEcritureDto {
    date_ecriture;
    libelle;
    compte_numero;
    compte_intitule;
    debit;
    credit;
    reference;
    piece;
}
exports.CreateEcritureDto = CreateEcritureDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date de l\'écriture', example: '2024-06-01' }),
    __metadata("design:type", String)
], CreateEcritureDto.prototype, "date_ecriture", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Libellé de l\'écriture', example: 'Achat de fournitures' }),
    __metadata("design:type", String)
], CreateEcritureDto.prototype, "libelle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Numéro du compte', example: '601100' }),
    __metadata("design:type", String)
], CreateEcritureDto.prototype, "compte_numero", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Intitulé du compte', example: 'Achats de matières premières' }),
    __metadata("design:type", String)
], CreateEcritureDto.prototype, "compte_intitule", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Montant au débit', example: 100000 }),
    __metadata("design:type", Number)
], CreateEcritureDto.prototype, "debit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Montant au crédit', example: 0 }),
    __metadata("design:type", Number)
], CreateEcritureDto.prototype, "credit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Référence de la pièce', example: 'FAC-2024-001', required: false }),
    __metadata("design:type", String)
], CreateEcritureDto.prototype, "reference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nom du fichier de la pièce jointe', example: 'facture.pdf', required: false }),
    __metadata("design:type", String)
], CreateEcritureDto.prototype, "piece", void 0);
//# sourceMappingURL=ecriture.dto.js.map