import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { Image } from "./Image";
import { Booking } from "./Booking";
import { Theatre } from "./Theatre";
import { UserNotification } from "./UserNotification";
import { Notification } from "./Notification";
import { Review } from "./Review";

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

  @ManyToOne(() => Theatre, (theatre) => theatre.staffs, {
    nullable: true,
    onDelete: "SET NULL",
  })
  theatre?: Theatre;

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(
    () => UserNotification,
    (userNotification) => userNotification.user,
  )
  notifications: UserNotification[];
}
