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
exports.UpdateUserDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class UpdateUserDto {
    raisonSociale;
    emailProfessionnel;
    telephone;
    motDePasse;
    role;
}
exports.UpdateUserDto = UpdateUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Raison sociale', example: 'Société ABC', required: false }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "raisonSociale", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email professionnel', example: 'contact@abc.com', required: false }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "emailProfessionnel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Téléphone', example: '+33612345678', required: false }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "telephone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Mot de passe (min 8 caractères)', example: 'StrongP@ssw0rd', required: false }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "motDePasse", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Rôle', example: 'user', required: false, enum: ['admin', 'user'] }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "role", void 0);
//# sourceMappingURL=update-user.dto.js.map