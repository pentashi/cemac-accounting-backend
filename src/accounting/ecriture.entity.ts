import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ecritures_comptables')
export class EcritureComptable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date_ecriture: string;

  @Column()
  libelle: string;

  @Column()
  compte_numero: string;

  @Column()
  compte_intitule: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  debit: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  credit: number;

  @Column({ nullable: true })
  reference: string;

  @Column({ nullable: true })
  piece: string;
}
