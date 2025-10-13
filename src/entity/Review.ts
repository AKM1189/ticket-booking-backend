import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Movie } from "./Movie";
import { User } from "./User";

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  rating: number;

  @Column()
  reviewDate: Date;

  @Column({ type: "text" })
  description: string;

  @Column({ nullable: true })
  updatedAt: Date;

  @ManyToOne(() => Movie, (movie) => movie.reviews)
  movie: Movie;

  @ManyToOne(() => User, (user) => user.reviews)
  user: User;
}
