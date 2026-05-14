import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FactureService } from './facture.service';
import { FactureController } from './facture.controller';
import { Facture } from './facture.entity';
import { LigneFacture } from './ligne-facture.entity';
import { AuditModule } from '../audit/audit.module';
import { NotificationModule } from '../notification/notification.module';
import { PaiementFacture } from './paiement-facture.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Facture, LigneFacture, PaiementFacture]),
    AuditModule,
    NotificationModule,
  ],
  providers: [FactureService],
  controllers: [FactureController],
  exports: [FactureService],
})
export class FactureModule {}
