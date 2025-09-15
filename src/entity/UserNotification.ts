import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";
import { Notification } from "./Notification";

@Entity()
export class UserNotification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.notifications)
  user: User;

  @ManyToOne(() => Notification, (notification) => notification.users)
  notification: Notification;

  @Column()
  read: boolean;

  @Column({ type: "date", nullable: true })
  readAt: string;
}
