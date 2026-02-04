import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';

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

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  montant_remise: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  tps: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  tva: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  total_ttc: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  acompte: number;

  @Column({ type: 'enum', enum: ['brouillon', 'envoyee', 'reglee', 'impayee'] })
  statut: 'brouillon' | 'envoyee' | 'reglee' | 'impayee';
}
