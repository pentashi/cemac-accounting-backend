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
exports.Settings = void 0;
const typeorm_1 = require("typeorm");
let Settings = class Settings {
    id;
    companyName;
    defaultCurrency;
    invoicePrefix;
    email2faEnabled;
    sms2faEnabled;
    whatsapp2faEnabled;
    partnerImportEnabled;
    partnerExportEnabled;
};
exports.Settings = Settings;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Settings.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'CEMAC Accounting' }),
    __metadata("design:type", String)
], Settings.prototype, "companyName", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'XAF' }),
    __metadata("design:type", String)
], Settings.prototype, "defaultCurrency", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'FAC' }),
    __metadata("design:type", String)
], Settings.prototype, "invoicePrefix", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Settings.prototype, "email2faEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Settings.prototype, "sms2faEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Settings.prototype, "whatsapp2faEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Settings.prototype, "partnerImportEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Settings.prototype, "partnerExportEnabled", void 0);
exports.Settings = Settings = __decorate([
    (0, typeorm_1.Entity)('settings')
], Settings);
//# sourceMappingURL=settings.entity.js.map