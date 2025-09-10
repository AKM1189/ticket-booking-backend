import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Movie } from "./Movie";
import { Theatre } from "./Theatre";
import { Screen } from "./Screen";
import { ScheduleSeatType } from "./ScheduleSeatType";
import { SeatType } from "./SeatType";
import { Booking } from "./Booking";

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "date" })
  showDate: string;

  @Column({ type: "time" })
  showTime: string;

  @Column("decimal", { precision: 5, scale: 2, default: 1.0 })
  multiplier: number;

  @Column()
  availableSeats: number;

  @Column("simple-array", { nullable: true })
  bookedSeats: string[];

  @Column()
  status: string;

  @Column()
  language: string;

  @Column()
  subtitle: string;

  @ManyToOne(() => Movie)
  movie: Movie;

  @ManyToOne(() => Theatre)
  theatre: Theatre;

  @ManyToOne(() => Screen)
  screen: Screen;

  @OneToMany(
    () => ScheduleSeatType,
    (scheduleSeatType) => scheduleSeatType.schedule,
  )
  seatTypes: SeatType[];

  @OneToMany(() => Booking, (booking) => booking.schedule)
  bookings: Booking[];
}
