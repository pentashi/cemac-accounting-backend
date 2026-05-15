import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('factures')
export class Facture {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  numero_facture: string;

  @Column({ type: 'date' })
  date_creation: string;

  @Column({ type: 'date' })
  date_echeance: string;

  @Column()
  client_id: number;

  @Column({ type: 'enum', enum: ['service', 'marchandise'] })
  type_vente: 'service' | 'marchandise';

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  sous_total_ht: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  montant_remise: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  tps: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_ht_apres_tps: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  sous_total_apres_remise: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  tva: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  total_ttc: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  acompte: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  montant_paye: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  solde_a_payer: number;

  @Column({ type: 'enum', enum: ['brouillon', 'envoyee', 'reglee', 'impayee'], default: 'brouillon' })
  statut: 'brouillon' | 'envoyee' | 'reglee' | 'impayee';
}
