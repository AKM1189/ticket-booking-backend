import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import dotenv from "dotenv";
import { Booking } from "./entity/Booking";
import { Cast } from "./entity/Cast";
import { Genre } from "./entity/Genre";
import { Image } from "./entity/Image";
import { Movie } from "./entity/Movie";
import { Notification } from "./entity/Notification";
import { Review } from "./entity/Review";
import { Schedule } from "./entity/Schedule";
import { ScheduleSeatType } from "./entity/ScheduleSeatType";
import { Screen } from "./entity/Screen";
import { ScreenSeatType } from "./entity/ScreenSeatType";
import { SeatType } from "./entity/SeatType";
import { Theatre } from "./entity/Theatre";
import { Ticket } from "./entity/Ticket";
import { UserNotification } from "./entity/UserNotification";

dotenv.config();

const host = process.env.DB_HOST;
const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306;
const username = process.env.DB_USERNAME || "root";
const password = process.env.DB_PASSWORD || "akm123";
const database = process.env.DB_NAME || "movie_ticket_booking";

export const AppDataSource = new DataSource({
  type: "mysql",
  host,
  port,
  username,
  password,
  database,
  synchronize: true,
  logging: false,
  entities: [
    Booking,
    Cast,
    Genre,
    Image,
    Movie,
    Notification,
    Review,
    Schedule,
    ScheduleSeatType,
    Screen,
    ScreenSeatType,
    SeatType,
    Theatre,
    Ticket,
    User,
    UserNotification,
  ],
  migrations: [],
  subscribers: [],
  connectTimeout: 10000, // 10 seconds
  extra: {
    connectionLimit: 5,
    connectTimeout: 10000,
  },
});
