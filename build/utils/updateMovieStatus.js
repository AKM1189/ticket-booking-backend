"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMovieStatus = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const data_source_1 = require("../data-source");
const Movie_1 = require("../entity/Movie");
const updateStatus_1 = require("./updateStatus");
const Schedule_1 = require("../entity/Schedule");
const dayjs_1 = __importDefault(require("dayjs"));
const Booking_1 = require("../entity/Booking");
const updateMovieStatus = () => {
    node_cron_1.default.schedule("*/5 * * * *", async () => {
        console.log("Running movie status update job...");
        const movieRepo = data_source_1.AppDataSource.getRepository(Movie_1.Movie);
        const movies = await movieRepo.find({
            relations: ["schedules"],
        });
        const updatedMovies = [];
        for (const movie of movies) {
            updatedMovies.push((0, updateStatus_1.updateMovie)(movie));
        }
        await movieRepo.save(updatedMovies);
        console.log("Movie status updated", (0, dayjs_1.default)().format("DD-MM-YYYY HH:mm"));
        console.log("Running schedule status update job...");
        const scheduleRepo = data_source_1.AppDataSource.getRepository(Schedule_1.Schedule);
        // const schedules = await scheduleRepo.find({
        //   relations: ["movie", 'bookings'],
        // });
        // const updatedSchedules = [];
        // for (const schedule of schedules) {
        //   updatedSchedules.push(updateSchedule(schedule));
        // }
        // await scheduleRepo.save(updatedSchedules);
        // console.log("Schedule status updated");
        /** ---------------- SCHEDULE STATUS UPDATE ---------------- **/
        const schedules = await scheduleRepo.find({
            relations: ["movie", "bookings"],
        });
        const bookingRepo = data_source_1.AppDataSource.getRepository(Booking_1.Booking);
        for (const schedule of schedules) {
            await (0, updateStatus_1.updateSchedule)(schedule, bookingRepo);
        }
        console.log("✅ Schedule & Booking statuses updated");
    });
};
exports.updateMovieStatus = updateMovieStatus;
//# sourceMappingURL=updateMovieStatus.js.map