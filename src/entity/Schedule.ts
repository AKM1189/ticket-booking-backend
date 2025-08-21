import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Movie } from "./Movie";
import { Theatre } from "./Theatre";
import { Screen } from "./Screen";

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  showDate: Date;

  @Column()
  showTime: Date;

  @Column()
  multiplier: number;

  @Column()
  availableSeats: number;

  @Column()
  isActive: boolean;

  @ManyToOne(() => Movie)
  movie: Movie;

  @ManyToOne(() => Theatre)
  theatre: Theatre;

  @ManyToOne(() => Screen)
  screen: Screen;
}
