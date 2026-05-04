"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const User_1 = require("./entity/User");
const dotenv_1 = __importDefault(require("dotenv"));
const Booking_1 = require("./entity/Booking");
const Cast_1 = require("./entity/Cast");
const Genre_1 = require("./entity/Genre");
const Image_1 = require("./entity/Image");
const Movie_1 = require("./entity/Movie");
const Notification_1 = require("./entity/Notification");
const Review_1 = require("./entity/Review");
const Schedule_1 = require("./entity/Schedule");
const ScheduleSeatType_1 = require("./entity/ScheduleSeatType");
const Screen_1 = require("./entity/Screen");
const ScreenSeatType_1 = require("./entity/ScreenSeatType");
const SeatType_1 = require("./entity/SeatType");
const Theatre_1 = require("./entity/Theatre");
const Ticket_1 = require("./entity/Ticket");
const UserNotification_1 = require("./entity/UserNotification");
dotenv_1.default.config();
const host = process.env.DB_HOST;
const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306;
const username = process.env.DB_USERNAME || "root";
const password = process.env.DB_PASSWORD || "akm123";
const database = process.env.DB_NAME || "movie_ticket_booking";
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mysql",
    host,
    port,
    username,
    password,
    database,
    synchronize: true,
    logging: false,
    entities: [
        Booking_1.Booking,
        Cast_1.Cast,
        Genre_1.Genre,
        Image_1.Image,
        Movie_1.Movie,
        Notification_1.Notification,
        Review_1.Review,
        Schedule_1.Schedule,
        ScheduleSeatType_1.ScheduleSeatType,
        Screen_1.Screen,
        ScreenSeatType_1.ScreenSeatType,
        SeatType_1.SeatType,
        Theatre_1.Theatre,
        Ticket_1.Ticket,
        User_1.User,
        UserNotification_1.UserNotification,
    ],
    migrations: [],
    subscribers: [],
    connectTimeout: 10000, // 10 seconds
    extra: {
        connectionLimit: 5,
        connectTimeout: 10000,
    },
});
//# sourceMappingURL=data-source.js.map