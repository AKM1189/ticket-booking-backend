import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Schedule } from "./Schedule";
import { SeatType } from "./SeatType";

@Entity("schedule_seat_types")
export class ScheduleSeatType {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Schedule, (schedule) => schedule.seatTypes)
  schedule: Schedule;

  @ManyToOne(() => SeatType, (seatType) => seatType.screens)
  seatType: SeatType;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;
}
