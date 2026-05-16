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
exports.CreateFournisseurDto = exports.CreateClientDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class CreateClientDto {
    nom;
    email;
    telephone;
    adresse;
    numero_contribuable;
}
exports.CreateClientDto = CreateClientDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nom du client', example: 'Entreprise ABC' }),
    __metadata("design:type", String)
], CreateClientDto.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email du client', example: 'contact@abc.com' }),
    __metadata("design:type", String)
], CreateClientDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Téléphone du client', example: '+237690000000' }),
    __metadata("design:type", String)
], CreateClientDto.prototype, "telephone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Adresse du client', example: '123 Rue Principale, Douala' }),
    __metadata("design:type", String)
], CreateClientDto.prototype, "adresse", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Numéro contribuable', example: 'M123456789', required: false }),
    __metadata("design:type", String)
], CreateClientDto.prototype, "numero_contribuable", void 0);
class CreateFournisseurDto {
    nom;
    email;
    telephone;
    adresse;
    numero_contribuable;
}
exports.CreateFournisseurDto = CreateFournisseurDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nom du fournisseur', example: 'Fournisseur XYZ' }),
    __metadata("design:type", String)
], CreateFournisseurDto.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email du fournisseur', example: 'contact@xyz.com' }),
    __metadata("design:type", String)
], CreateFournisseurDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Téléphone du fournisseur', example: '+237699999999' }),
    __metadata("design:type", String)
], CreateFournisseurDto.prototype, "telephone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Adresse du fournisseur', example: '456 Avenue Centrale, Yaoundé' }),
    __metadata("design:type", String)
], CreateFournisseurDto.prototype, "adresse", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Numéro contribuable', example: 'F987654321', required: false }),
    __metadata("design:type", String)
], CreateFournisseurDto.prototype, "numero_contribuable", void 0);
//# sourceMappingURL=partner.dto.js.map