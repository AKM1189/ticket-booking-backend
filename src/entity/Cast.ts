import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Movie } from "./Movie";
import { Image } from "./Image";

@Entity()
export class Cast {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  role: string;

  @OneToOne(() => Image)
  @JoinColumn()
  image: Image;

  @ManyToMany(() => Movie, (movie) => movie.casts)
  @JoinTable()
  movies: Movie[];
}
