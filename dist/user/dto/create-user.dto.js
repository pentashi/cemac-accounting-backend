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
exports.CreateUserDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class CreateUserDto {
    raisonSociale;
    emailProfessionnel;
    telephone;
    motDePasse;
    confirmerMotDePasse;
    verificationCode;
    verificationCodeExpires;
    isVerified;
    resetCode;
    resetCodeExpires;
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Raison sociale', example: 'Société ABC' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "raisonSociale", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email professionnel', example: 'contact@abc.com' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "emailProfessionnel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Téléphone', example: '+33612345678' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "telephone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Mot de passe (min 8 caractères)', example: 'StrongP@ssw0rd' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "motDePasse", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Confirmer le mot de passe', example: 'StrongP@ssw0rd' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "confirmerMotDePasse", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Code de vérification', example: '123456', required: false }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "verificationCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Expiration du code de vérification (timestamp)', example: 1714500000000, required: false }),
    __metadata("design:type", Number)
], CreateUserDto.prototype, "verificationCodeExpires", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Utilisateur vérifié', example: false, required: false }),
    __metadata("design:type", Boolean)
], CreateUserDto.prototype, "isVerified", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Code de réinitialisation', example: '654321', required: false }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "resetCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Expiration du code de réinitialisation (timestamp)', example: 1714500000000, required: false }),
    __metadata("design:type", Number)
], CreateUserDto.prototype, "resetCodeExpires", void 0);
//# sourceMappingURL=create-user.dto.js.map