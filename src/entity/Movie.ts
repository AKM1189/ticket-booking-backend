import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  Long,
  ManyToOne,
} from "typeorm";
import { Genre } from "./Genre";
import { Review } from "./Review";
import { Cast } from "./Cast";
import { Image } from "./Image";
import { Schedule } from "./Schedule";

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  title: string;

  @Column({ nullable: true, type: "longtext" })
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

  @Column({ nullable: true })
  trailerId: string;

  @Column("simple-array")
  experience: string[];

  @Column({ nullable: true })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;

  @ManyToMany(() => Genre)
  @JoinTable()
  genres: Genre[];

  @ManyToMany(() => Cast, (cast) => cast.movies, { eager: true })
  @JoinTable()
  casts: Cast[];

  @OneToMany(() => Review, (review) => review.movie)
  reviews: Review[];

  @ManyToOne(() => Image)
  poster: Image;

  @ManyToMany(() => Image)
  @JoinTable()
  photos: Image[];

  @OneToMany(() => Schedule, (schedule) => schedule.movie)
  schedules: Schedule[];
}
