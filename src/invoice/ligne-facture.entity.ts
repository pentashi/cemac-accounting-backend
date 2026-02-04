import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('lignes_facture')
export class LigneFacture {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  facture_id: number;

  @Column()
  numero_produit: string;

  @Column()
  intitule: string;

  @Column({ type: 'int' })
  quantite: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  prix_unitaire_ht: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  taux_tva: number;
}
