import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Booking } from "./Booking";

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ticketNumber: string; // e.g. "MOV-2025-scid bookid date"

  @Column({ type: "longtext" })
  qrCode: string; // store QR base64 or file path

  @CreateDateColumn()
  issuedAt: Date;
}
