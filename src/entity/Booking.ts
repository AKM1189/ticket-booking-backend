import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Schedule } from "./Schedule";
import { User } from "./User";
import { Ticket } from "./Ticket";

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bookingDate: Date;

  @Column("simple-array")
  seatList: string[];

  @Column("decimal", { precision: 5, scale: 2, default: 1.0 })
  totalAmount: string;

  @Column()
  status: string;

  @Column()
  customerName: string;

  @Column({ nullable: true })
  customerEmail: string;

  @Column({ nullable: true })
  customerPhone: string;

  @Column({ nullable: true, type: "text" })
  cancelledReason: string;

  @Column({ nullable: true, type: "longtext" })
  note: string;

  @ManyToOne(() => Schedule, (schedule) => schedule.bookings)
  schedule: Schedule;

  @ManyToOne(() => User, (user) => user.bookings)
  user: User;

  @OneToOne(() => Ticket)
  @JoinColumn()
  ticket: Ticket;
}
