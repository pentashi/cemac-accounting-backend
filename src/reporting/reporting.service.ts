import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EcritureComptable } from '../accounting/ecriture.entity';

@Injectable()
export class ReportingService {
  constructor(
    @InjectRepository(EcritureComptable)
    private ecritureRepo: Repository<EcritureComptable>,
  ) {}

  async getSalesStats() {
    // Classe 7 = ventes
    const entries = await this.ecritureRepo.find();
    let totalVentes = 0;
    for (const entry of entries) {
      if (entry.compte_numero.startsWith('7')) {
        totalVentes += Number(entry.credit) - Number(entry.debit);
      }
    }
    return { totalVentes };
  }

  async getPurchasesStats() {
    // Classe 6 = achats
    const entries = await this.ecritureRepo.find();
    let totalAchats = 0;
    for (const entry of entries) {
      if (entry.compte_numero.startsWith('6')) {
        totalAchats += Number(entry.debit) - Number(entry.credit);
      }
    }
    return { totalAchats };
  }

  async getPerformanceIndicators() {
    const sales = await this.getSalesStats();
    const purchases = await this.getPurchasesStats();
    const marge = sales.totalVentes - purchases.totalAchats;
    return { ...sales, ...purchases, marge };
  }
}
