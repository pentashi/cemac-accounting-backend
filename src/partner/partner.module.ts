import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnerService } from './partner.service';
import { PartnerController } from './partner.controller';
import { Client, Fournisseur } from './partner.entity';
import { AuditModule } from '../audit/audit.module';
import { FactureModule } from '../invoice/facture.module';

@Module({
  imports: [TypeOrmModule.forFeature([Client, Fournisseur]), AuditModule, FactureModule],
  providers: [PartnerService],
  controllers: [PartnerController],
})
export class PartnerModule {}
