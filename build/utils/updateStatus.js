"use strict";
// import dayjs from "dayjs";
// import { MovieStatus } from "../types/MovieType";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSchedule = exports.updateMovie = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const MovieType_1 = require("../types/MovieType");
const Schedule_1 = require("../entity/Schedule");
const ScheduleType_1 = require("../types/ScheduleType");
const data_source_1 = require("../data-source");
const updateMovie = (movie) => {
    const today = (0, dayjs_1.default)();
    if (!movie.schedules || movie.schedules.length === 0) {
        movie.status = MovieType_1.MovieStatus.comingSoon;
        return movie;
    }
    const showDates = movie.schedules.map((s) => (0, dayjs_1.default)(s.showDate));
    const hasToday = showDates.some((d) => d.isSame(today, "day"));
    const hasFuture = showDates.some((d) => d.isAfter(today, "day"));
    const hasPast = showDates.some((d) => d.isBefore(today, "day"));
    const comingSoon = (0, dayjs_1.default)(movie.releaseDate).isAfter(today, "day");
    if (hasToday) {
        movie.status = MovieType_1.MovieStatus.nowShowing;
    }
    else if (hasFuture) {
        movie.status = MovieType_1.MovieStatus.ticketAvailable;
    }
    else if (hasPast) {
        movie.status = MovieType_1.MovieStatus.ended;
    }
    else if (comingSoon) {
        movie.status = MovieType_1.MovieStatus.comingSoon;
    }
    return movie;
};
exports.updateMovie = updateMovie;
// export const updateSchedule = (schedule: Schedule): Schedule => {
//   const now = dayjs();
//   // Build proper datetime from showDate + showTime
//   const showDateTime = dayjs(
//     `${schedule.showDate} ${schedule.showTime}`,
//     "YYYY-MM-DD HH:mm",
//   );
//   const endDateTime = showDateTime.add(
//     parseInt(schedule?.movie?.duration),
//     "minute",
//   );
//   if (schedule.status === ScheduleStatus.inActive) {
//     // Leave it inactive if already set
//     schedule.status = ScheduleStatus.inActive;
//   } else if (now.isAfter(endDateTime)) {
//     // Show ended
//     schedule.status = ScheduleStatus.completed;
//     schedule.bookings.map(booking => {
//       if (booking.status === 'confirmed') {
//         booking.status = 'ended'
//         await bookingRepo.save(booking)
//       }
//     })
//   } else if (
//     now.isAfter(showDateTime.subtract(15, "minute")) &&
//     now.isBefore(endDateTime)
//   ) {
//     // Within 15 minutes before start, or during the show
//     schedule.status = ScheduleStatus.ongoing;
//   } else if (now.isBefore(showDateTime.subtract(15, "minute"))) {
//     // Future but bookable
//     schedule.status = ScheduleStatus.active;
//   }
//   return schedule;
// };
const updateSchedule = async (schedule, bookingRepo) => {
    const now = (0, dayjs_1.default)();
    // Build proper datetime from showDate + showTime
    const showDateTime = (0, dayjs_1.default)(`${schedule.showDate} ${schedule.showTime}`, "YYYY-MM-DD HH:mm");
    const endDateTime = showDateTime.add(parseInt(schedule?.movie?.duration), "minute");
    /** ---------------- DETERMINE SCHEDULE STATUS ---------------- **/
    if (schedule.status === ScheduleType_1.ScheduleStatus.inActive) {
        schedule.status = ScheduleType_1.ScheduleStatus.inActive;
    }
    else if (now.isAfter(endDateTime)) {
        // Show has ended
        schedule.status = ScheduleType_1.ScheduleStatus.completed;
        // Update bookings that were confirmed but now ended
        for (const booking of schedule.bookings) {
            if (booking.status === "confirmed") {
                booking.status = "completed";
                await bookingRepo.save(booking);
            }
        }
    }
    else if (now.isAfter(showDateTime.subtract(15, "minute")) &&
        now.isBefore(endDateTime)) {
        schedule.status = ScheduleType_1.ScheduleStatus.ongoing;
    }
    else if (now.isBefore(showDateTime.subtract(15, "minute"))) {
        schedule.status = ScheduleType_1.ScheduleStatus.active;
    }
    const scheduleRepo = data_source_1.AppDataSource.getRepository(Schedule_1.Schedule);
    await scheduleRepo.save(schedule);
    return schedule;
};
exports.updateSchedule = updateSchedule;
//# sourceMappingURL=updateStatus.js.map