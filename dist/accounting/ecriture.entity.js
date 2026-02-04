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
exports.EcritureComptable = void 0;
const typeorm_1 = require("typeorm");
let EcritureComptable = class EcritureComptable {
    id;
    date_ecriture;
    libelle;
    compte_numero;
    compte_intitule;
    debit;
    credit;
    reference;
    piece;
};
exports.EcritureComptable = EcritureComptable;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EcritureComptable.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], EcritureComptable.prototype, "date_ecriture", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EcritureComptable.prototype, "libelle", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EcritureComptable.prototype, "compte_numero", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EcritureComptable.prototype, "compte_intitule", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], EcritureComptable.prototype, "debit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], EcritureComptable.prototype, "credit", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EcritureComptable.prototype, "reference", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EcritureComptable.prototype, "piece", void 0);
exports.EcritureComptable = EcritureComptable = __decorate([
    (0, typeorm_1.Entity)('ecritures_comptables')
], EcritureComptable);
//# sourceMappingURL=ecriture.entity.js.map