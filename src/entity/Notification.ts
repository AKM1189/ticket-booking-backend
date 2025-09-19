import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { UserNotification } from "./UserNotification";
import { User } from "./User";

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  title: string;

  @Column({ type: "text" })
  message: string;

  @Column()
  createdAt: Date;

  @OneToMany(
    () => UserNotification,
    (userNotification) => userNotification.notification,
  )
  users: UserNotification[];
}
