import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportingService } from './reporting.service';
import { ReportingController } from './reporting.controller';
import { EcritureComptable } from '../accounting/ecriture.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([EcritureComptable]), AuditModule],
  controllers: [ReportingController],
  providers: [ReportingService],
})
export class ReportingModule {}
