import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Screen } from "./Screen";
import { Schedule } from "./Schedule";

@Entity()
export class Theatre {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true, type: "longtext" })
  location: string;

  @Column()
  region: string;

  @Column()
  city: string;

  @Column()
  phoneNo: string;

  @Column()
  totalScreens: number;

  @Column()
  active: boolean;

  @OneToMany(() => Screen, (screen) => screen.theatre)
  screens: Screen[];

  @OneToMany(() => Schedule, (schedule) => schedule.theatre)
  schedules: Schedule[];
}
