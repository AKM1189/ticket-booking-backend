import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Genre {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true, type: "longtext" })
  description: string;

  @Column()
  movieCount: number;

  @Column()
  color: string;
}
