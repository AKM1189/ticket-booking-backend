"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleService = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const data_source_1 = require("../../data-source");
const Movie_1 = require("../../entity/Movie");
const Schedule_1 = require("../../entity/Schedule");
const Screen_1 = require("../../entity/Screen");
const Theatre_1 = require("../../entity/Theatre");
const ScheduleType_1 = require("../../types/ScheduleType");
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
const SeatType_1 = require("../../entity/SeatType");
const ScheduleSeatType_1 = require("../../entity/ScheduleSeatType");
const updateStatus_1 = require("../../utils/updateStatus");
const typeorm_1 = require("typeorm");
const addNoti_1 = require("../../utils/addNoti");
const constants_1 = require("../../constants");
const AuthType_1 = require("../../types/AuthType");
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
let date = dayjs_1.default.utc();
class ScheduleService {
    scheduleRepo = data_source_1.AppDataSource.getRepository(Schedule_1.Schedule);
    movieRepo = data_source_1.AppDataSource.getRepository(Movie_1.Movie);
    theatreRepo = data_source_1.AppDataSource.getRepository(Theatre_1.Theatre);
    screenRepo = data_source_1.AppDataSource.getRepository(Screen_1.Screen);
    seatTypeRepo = data_source_1.AppDataSource.getRepository(SeatType_1.SeatType);
    scheduleSeatTypeRepo = data_source_1.AppDataSource.getRepository(ScheduleSeatType_1.ScheduleSeatType);
    async getSchedule(page, limit, sortBy, sortOrder, search, date, user) {
        let whereClause = {};
        if (user.role === AuthType_1.Role.staff) {
            const theatre = { id: user.theatre?.id };
            if (search && date) {
                whereClause = [
                    { showDate: date, movie: { title: (0, typeorm_1.Like)(`%${search}%`) } },
                    { theatre, showDate: date, screen: { name: (0, typeorm_1.Like)(`%${search}%`) } },
                    { theatre, showDate: date, showTime: (0, typeorm_1.Like)(`%${search}%`) },
                    { theatre, showDate: date, status: (0, typeorm_1.Like)(`%${search}%`) },
                ];
            }
            else if (search) {
                whereClause = [
                    { theatre, movie: { title: (0, typeorm_1.Like)(`%${search}%`) } },
                    { theatre, screen: { name: (0, typeorm_1.Like)(`%${search}%`) } },
                    { theatre, showTime: (0, typeorm_1.Like)(`%${search}%`) },
                    { theatre, status: (0, typeorm_1.Like)(`%${search}%`) },
                ];
            }
            else {
                whereClause = { theatre, showDate: date };
            }
        }
        if (user.role === AuthType_1.Role.admin) {
            if (search && date) {
                whereClause = [
                    { showDate: date, movie: { title: (0, typeorm_1.Like)(`%${search}%`) } },
                    { showDate: date, theatre: { location: (0, typeorm_1.Like)(`%${search}%`) } },
                    { showDate: date, screen: { name: (0, typeorm_1.Like)(`%${search}%`) } },
                    { showDate: date, showTime: (0, typeorm_1.Like)(`%${search}%`) },
                    { showDate: date, status: (0, typeorm_1.Like)(`%${search}%`) },
                ];
            }
            else if (search) {
                whereClause = [
                    { movie: { title: (0, typeorm_1.Like)(`%${search}%`) } },
                    { theatre: { location: (0, typeorm_1.Like)(`%${search}%`) } },
                    { screen: { name: (0, typeorm_1.Like)(`%${search}%`) } },
                    { showTime: (0, typeorm_1.Like)(`%${search}%`) },
                    { status: (0, typeorm_1.Like)(`%${search}%`) },
                ];
            }
            else {
                whereClause = { showDate: date };
            }
        }
        const [schedules, total] = await this.scheduleRepo.findAndCount({
            relations: [
                "movie",
                "theatre",
                "screen",
                "seatTypes",
                "screen.seatTypes.seatType",
                "movie.poster",
                "movie.photos",
            ],
            order: {
                showDate: "DESC",
            },
            skip: (page - 1) * limit,
            take: limit,
            where: whereClause,
        });
        const seatTypes = await this.seatTypeRepo.find();
        const formattedSchedules = schedules.map((schedule) => {
            const seatTypeList = seatTypes.map((item) => {
                const price = item.price * schedule.multiplier * schedule.screen.multiplier;
                return {
                    ...item,
                    price: parseFloat(price.toString()).toFixed(2),
                };
            });
            return {
                ...schedule,
                showTime: schedule.showTime.slice(0, 5),
                priceList: seatTypeList,
            };
        });
        return {
            status: 200,
            data: formattedSchedules,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    // async getScheduleByShowDetail(
    //   movieId: string,
    //   theatreId: string,
    //   screenId: string,
    //   showDate: string,
    //   showTime: string,
    // ) {
    //   const today = dayjs().format("YYYY-MM-DD");
    //   const time = dayjs().format("HH:mm:ss");
    //   const schedules = await AppDataSource.getRepository(Schedule)
    //     .createQueryBuilder("schedule")
    //     .where("schedule.movieId = :movieId", { movieId })
    //     .andWhere("schedule.theatreId = :theatreId", { theatreId })
    //     .andWhere("schedule.screenId = :screenId", { screenId })
    //     .andWhere("schedule.showDate = :showDate", { showDate })
    //     .andWhere("schedule.showTime = :showTime", { showTime })
    //     .andWhere("schedule.status != :status", {
    //       status: ScheduleStatus.inActive,
    //     })
    //     .getMany();
    //   if (!schedules || !schedules.length) {
    //     return {
    //       status: 404,
    //       message: "No schedule found for this show detail",
    //     };
    //   }
    //   const screen = await this.screenRepo.findOne({
    //     where: { id: parseInt(screenId) },
    //   });
    //   const seatTypes = await this.seatTypeRepo.find();
    //   const seatTypeList = seatTypes.map((item) => {
    //     const price = item.price * schedules[0]?.multiplier * screen?.multiplier;
    //     return {
    //       ...item,
    //       price: parseFloat(price.toString()).toFixed(2),
    //     };
    //   });
    //   const updatedSchedule = {
    //     ...schedules[0],
    //     priceList: seatTypeList,
    //   };
    //   return {
    //     status: 200,
    //     data: updatedSchedule,
    //   };
    // }
    async getScheduleByShowDetail(movieId, theatreId, screenId, showDate, showTime) {
        const parsedScreenId = Number(screenId);
        if (isNaN(parsedScreenId)) {
            return { status: 400, message: "Invalid screenId" };
        }
        const schedules = await data_source_1.AppDataSource.getRepository(Schedule_1.Schedule)
            .createQueryBuilder("schedule")
            .where("schedule.movieId = :movieId", { movieId })
            .andWhere("schedule.theatreId = :theatreId", { theatreId })
            .andWhere("schedule.screenId = :screenId", { screenId })
            .andWhere("schedule.showDate = :showDate", { showDate })
            .andWhere("schedule.showTime = :showTime", { showTime })
            .andWhere("schedule.status != :status", {
            status: ScheduleType_1.ScheduleStatus.inActive,
        })
            .getMany();
        if (!schedules.length) {
            return { status: 404, message: "No schedule found" };
        }
        const screen = await this.screenRepo.findOne({
            where: { id: parsedScreenId },
        });
        const seatTypes = await this.seatTypeRepo.find();
        const seatTypeList = seatTypes.map((item) => {
            const price = item.price * schedules[0].multiplier * (screen?.multiplier ?? 1);
            return {
                ...item,
                price: price.toFixed(2),
            };
        });
        return {
            status: 200,
            data: {
                ...schedules[0],
                priceList: seatTypeList,
            },
        };
    }
    async getShowDate(movieId, theatreId, screenId) {
        const today = (0, dayjs_1.default)().format("YYYY-MM-DD");
        const time = (0, dayjs_1.default)().format("HH:mm:ss");
        const showDates = await data_source_1.AppDataSource.getRepository(Schedule_1.Schedule)
            .createQueryBuilder("schedule")
            .select("DISTINCT schedule.showDate", "showDate")
            .where("schedule.movieId = :movieId", { movieId })
            .andWhere("schedule.theatreId = :theatreId", { theatreId })
            .andWhere("schedule.screenId = :screenId", { screenId })
            .andWhere("schedule.status NOT IN (:...statuses)", {
            statuses: [ScheduleType_1.ScheduleStatus.inActive, ScheduleType_1.ScheduleStatus.completed],
        })
            .andWhere(`((schedule.showDate = :today AND schedule.showTime >= :time) OR (schedule.showDate > :today))`, { today, time })
            .getRawMany();
        const formattedShowDates = showDates.map((date) => (0, dayjs_1.default)(date.showDate).tz("Asia/Yangon").format("DD-MM-YYYY"));
        return {
            status: 200,
            data: formattedShowDates,
        };
    }
    async getShowTime(movieId, theatreId, screenId, showDate) {
        const today = (0, dayjs_1.default)().format("YYYY-MM-DD");
        const time = (0, dayjs_1.default)().format("HH:mm:ss");
        const showTimes = await data_source_1.AppDataSource.getRepository(Schedule_1.Schedule)
            .createQueryBuilder("schedule")
            .select("DISTINCT schedule.showTime", "showTime")
            .where("schedule.movieId = :movieId", { movieId })
            .andWhere("schedule.theatreId = :theatreId", { theatreId })
            .andWhere("schedule.screenId = :screenId", { screenId })
            .andWhere("schedule.showDate = :showDate", { showDate })
            // .andWhere(
            //   `((schedule.showDate = :today AND schedule.showTime >= :time) OR (schedule.showDate > :today))`,
            //   { today, time },
            // )
            .andWhere("schedule.status NOT IN (:...statuses)", {
            statuses: [ScheduleType_1.ScheduleStatus.inActive, ScheduleType_1.ScheduleStatus.completed],
        })
            .getRawMany();
        const formattedShowDates = showTimes.map((time) => time.showTime.slice(0, 5));
        return {
            status: 200,
            data: formattedShowDates,
        };
    }
    async addSchedule(body, user) {
        const { showDate, showTime, movieId, theatreId, screenId, language, subtitle, } = body;
        const existingShow = await this.scheduleRepo.findOne({
            where: { showDate, showTime, screen: { id: screenId } },
        });
        if (existingShow) {
            throw new Error("Schedule already exists.");
        }
        const movie = await this.movieRepo.findOne({
            relations: ["schedules"],
            where: { id: movieId },
        });
        const theatre = theatreId
            ? await this.theatreRepo.findOne({ where: { id: theatreId } })
            : {};
        const screen = await this.screenRepo.findOne({
            where: { id: screenId, theatre: { id: theatreId } },
        });
        if (!movie) {
            throw new Error("Movie does not exists!");
        }
        if (!theatre) {
            throw new Error("Theatre does not exists!");
        }
        if (!screen) {
            throw new Error("Screen does not exists!");
        }
        const newShow = this.scheduleRepo.create({
            showDate,
            showTime,
            multiplier: parseFloat(body.multiplier),
            availableSeats: body.availableSeats,
            status: body.isActive ? ScheduleType_1.ScheduleStatus.active : ScheduleType_1.ScheduleStatus.inActive,
            language,
            subtitle,
            movie,
            theatre: theatre,
            screen: screen,
            bookedSeats: [],
        });
        const show = await this.scheduleRepo.save(newShow);
        const seatTypes = await this.seatTypeRepo.find();
        for (const type of seatTypes) {
            const updatedPrice = newShow?.multiplier * type.price * screen?.multiplier;
            const scheduleSeatType = this.scheduleSeatTypeRepo.create({
                schedule: newShow,
                seatType: type,
                price: updatedPrice,
            });
            if (scheduleSeatType) {
                await this.scheduleSeatTypeRepo.save(scheduleSeatType);
            }
        }
        movie.schedules.push(show); // include the new schedule
        const updatedMovie = (0, updateStatus_1.updateMovie)(movie);
        await this.movieRepo.save(updatedMovie);
        const message = `${user.name} created New Schedule for '${movie?.title.toUpperCase()}' at ${screen.name} on ${show?.showDate}, ${show?.showTime.slice(0, 5)}.`;
        (0, addNoti_1.addNotification)(constants_1.NOTI_TYPE.SCHEDULE_ADDED, "Schedule Added", message, user.id, theatre?.id);
        return {
            status: 200,
            message: "Schedule added successfully",
            data: newShow,
        };
    }
    async updateSchedule(scheduleId, body, user) {
        const { showDate, showTime, movieId, theatreId, screenId, language, subtitle, } = body;
        const schedule = await this.scheduleRepo.findOne({
            where: { id: scheduleId },
        });
        if (schedule.bookedSeats?.length > 0) {
            throw new Error("Schedule cannot be updated as bookings are made!");
        }
        if (!schedule) {
            throw new Error("Schedule does not exists.");
        }
        const existingShow = await this.scheduleRepo.findOne({
            where: { showDate, showTime, screen: { id: screenId } },
        });
        if (existingShow && existingShow.id !== schedule.id) {
            throw new Error("Schedule already exists.");
        }
        const movie = await this.movieRepo.findOne({
            relations: ["schedules"],
            where: { id: movieId },
        });
        const theatre = theatreId
            ? await this.theatreRepo.findOne({ where: { id: theatreId } })
            : {};
        const screen = await this.screenRepo.findOne({ where: { id: screenId } });
        const updatedSchedule = {
            ...schedule,
            showDate,
            showTime,
            multiplier: parseFloat(body.multiplier),
            availableSeats: body.availableSeats,
            status: !body.isActive ? ScheduleType_1.ScheduleStatus.inActive : schedule.status,
            language,
            subtitle,
            movie: movie,
            theatre: theatre,
            screen: screen,
        };
        await this.scheduleRepo.save(updatedSchedule);
        const seatTypes = await this.seatTypeRepo.find();
        const scheduleSeatTypes = await this.scheduleSeatTypeRepo.find({
            relations: ["schedule", "seatType"],
            where: { schedule: { id: scheduleId } },
        });
        for (const type of seatTypes) {
            const selectedType = scheduleSeatTypes.find((item) => item.seatType.id === type.id);
            const updatedPrice = updatedSchedule?.multiplier * screen?.multiplier * type.price;
            const scheduleSeatType = this.scheduleSeatTypeRepo.create({
                ...(selectedType ?? {}), // existing record will be updated
                schedule: updatedSchedule,
                seatType: type,
                price: updatedPrice,
            });
            await this.scheduleSeatTypeRepo.save(scheduleSeatType);
        }
        if (movie) {
            const updatedMovie = movie ? (0, updateStatus_1.updateMovie)(movie) : null;
            await this.movieRepo.save(updatedMovie);
        }
        const message = `${user.name} updated Schedule for '${movie?.title.toUpperCase()}' at ${screen.name} on ${schedule?.showDate}, ${schedule?.showTime.slice(0, 5)}).`;
        (0, addNoti_1.addNotification)(constants_1.NOTI_TYPE.SCHEDULE_UPDATED, "Schedule Updated", message, user.id, theatre?.id);
        return {
            status: 200,
            message: "Schedule updated successfully",
            data: updatedSchedule,
        };
    }
    async deleteSchedule(scheduleId, user) {
        const schedule = await this.scheduleRepo.findOne({
            relations: ["movie", "screen", "theatre"],
            where: { id: scheduleId },
        });
        const scheduleSeatTypeList = await this.scheduleSeatTypeRepo.find({
            where: { schedule: { id: scheduleId } },
        });
        for (const type of scheduleSeatTypeList) {
            await this.scheduleSeatTypeRepo.remove(type);
        }
        if (!schedule) {
            throw new Error("Schedule does not exists.");
        }
        if (schedule.bookedSeats?.length > 0) {
            throw new Error("Schedule cannot be deleted");
        }
        await this.scheduleRepo.remove(schedule);
        if (schedule.movie) {
            const updatedMovie = schedule.movie ? (0, updateStatus_1.updateMovie)(schedule.movie) : null;
            await this.movieRepo.save(updatedMovie);
        }
        const message = `${user.name} cancelled Schedule for '${schedule?.movie?.title.toUpperCase()}' at ${schedule?.screen.name} on ${schedule?.showDate}, ${schedule?.showTime.slice(0, 5)}).`;
        (0, addNoti_1.addNotification)(constants_1.NOTI_TYPE.SCHEDULE_DELETED, "Schedule Cancelled", message, user.id, schedule?.theatre?.id);
        return {
            status: 200,
            message: "Schedule deleted successfully",
        };
    }
}
exports.ScheduleService = ScheduleService;
//# sourceMappingURL=schedule.service.js.map