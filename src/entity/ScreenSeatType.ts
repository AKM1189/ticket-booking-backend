import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Screen } from "./Screen";
import { SeatType } from "./SeatType";

@Entity("screen_seat_types")
export class ScreenSeatType {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Screen, (screen) => screen.seatTypes, {
    onDelete: "CASCADE",
  })
  screen: Screen;

  @ManyToOne(() => SeatType, (seatType) => seatType.screens, {
    onDelete: "CASCADE",
  })
  seatType: SeatType;

  // 👉 Add new column here
  @Column("simple-array")
  seatList: string[];
}
