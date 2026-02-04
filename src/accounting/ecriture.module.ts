import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EcritureComptable } from './ecriture.entity';
import { EcritureService } from './ecriture.service';
import { EcritureController } from './ecriture.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([EcritureComptable]), AuditModule],
  providers: [EcritureService],
  controllers: [EcritureController],
})
export class EcritureModule {}
