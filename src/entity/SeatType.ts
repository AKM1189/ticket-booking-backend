import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm";
import { Screen } from "./Screen";
import { ScreenSeatType } from "./ScreenSeatType";
import { ScheduleSeatType } from "./ScheduleSeatType";

@Entity()
export class SeatType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @OneToMany(() => ScreenSeatType, (screenSeatType) => screenSeatType.seatType)
  screens: ScreenSeatType[];

  @OneToMany(
    () => ScheduleSeatType,
    (scheduleSeatType) => scheduleSeatType.seatType,
  )
  schedules: ScheduleSeatType[];
}
