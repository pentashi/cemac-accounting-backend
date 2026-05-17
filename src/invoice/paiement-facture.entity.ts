import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('paiements_facture')
export class PaiementFacture {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  factureId: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  montant: number;

  @Column({ type: 'varchar' })
  canal: string;

  @Column({ type: 'varchar', nullable: true })
  reference?: string;

  @Column({ type: 'varchar', nullable: true })
  note?: string;

  @Column({ type: 'date' })
  datePaiement: string;

  @CreateDateColumn()
  createdAt: Date;
}
