import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Theatre } from "./Theatre";
import { SeatType } from "./SeatType";
import { ScreenSeatType } from "./ScreenSeatType";
import { Schedule } from "./Schedule";

@Entity()
export class Screen {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  capacity: number;

  @Column()
  rows: number;

  @Column()
  cols: number;

  @Column()
  type: string;

  @Column()
  active: boolean;

  @Column("decimal", { precision: 5, scale: 2, default: 1.0 })
  multiplier: number;

  @Column("simple-array")
  disabledSeats: string[];

  @Column("simple-array")
  aisles: number[];

  @Column({ nullable: true })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;

  @ManyToOne(() => Theatre)
  theatre: Theatre;

  @OneToMany(() => ScreenSeatType, (screenSeatType) => screenSeatType.screen)
  seatTypes: SeatType[];

  @OneToMany(() => Schedule, (schedule) => schedule.screen)
  schedules: Schedule[];
}
