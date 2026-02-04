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
exports.Facture = void 0;
const typeorm_1 = require("typeorm");
let Facture = class Facture {
    id;
    numero_facture;
    date_creation;
    date_echeance;
    client_id;
    type_vente;
    sous_total_ht;
    montant_remise;
    tps;
    tva;
    total_ttc;
    acompte;
    statut;
};
exports.Facture = Facture;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Facture.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Facture.prototype, "numero_facture", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], Facture.prototype, "date_creation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], Facture.prototype, "date_echeance", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Facture.prototype, "client_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['service', 'marchandise'] }),
    __metadata("design:type", String)
], Facture.prototype, "type_vente", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Facture.prototype, "sous_total_ht", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Facture.prototype, "montant_remise", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Facture.prototype, "tps", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Facture.prototype, "tva", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Facture.prototype, "total_ttc", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Facture.prototype, "acompte", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['brouillon', 'envoyee', 'reglee', 'impayee'] }),
    __metadata("design:type", String)
], Facture.prototype, "statut", void 0);
exports.Facture = Facture = __decorate([
    (0, typeorm_1.Entity)('factures')
], Facture);
//# sourceMappingURL=facture.entity.js.map