import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Image } from "./Image";

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
}
