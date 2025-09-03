import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Image } from "./Image";
import { Booking } from "./Booking";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phoneNo: string;

  @Column()
  password: string;

  @Column()
  role: string;

  @Column()
  active: boolean;

  @OneToOne(() => Image, { nullable: true })
  @JoinColumn()
  image: Image;

  @Column({ nullable: true })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking;
}
