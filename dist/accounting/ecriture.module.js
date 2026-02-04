"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EcritureModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const ecriture_entity_1 = require("./ecriture.entity");
const ecriture_service_1 = require("./ecriture.service");
const ecriture_controller_1 = require("./ecriture.controller");
const audit_module_1 = require("../audit/audit.module");
let EcritureModule = class EcritureModule {
};
exports.EcritureModule = EcritureModule;
exports.EcritureModule = EcritureModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([ecriture_entity_1.EcritureComptable]), audit_module_1.AuditModule],
        providers: [ecriture_service_1.EcritureService],
        controllers: [ecriture_controller_1.EcritureController],
    })
], EcritureModule);
//# sourceMappingURL=ecriture.module.js.map