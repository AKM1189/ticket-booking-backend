import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Genre } from "./Genre";

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  duration: string;

  @Column("simple-array")
  language: string[];

  @Column("simple-array")
  subtitle: string[];

  @Column()
  releaseDate: Date;

  @Column()
  status: string;

  @Column()
  posterUrl: string;

  @Column({ nullable: true })
  trailerId: string;

  @Column("simple-array", { nullable: true })
  photos: string[];

  @Column("simple-array")
  experience: string[];

  @Column({ nullable: true })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;

  @ManyToMany((type) => Genre)
  @JoinTable()
  genres: Genre[];
}
