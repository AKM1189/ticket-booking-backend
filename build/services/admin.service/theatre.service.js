"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TheatreService = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../../data-source");
const Theatre_1 = require("../../entity/Theatre");
const dayjs_1 = __importDefault(require("dayjs"));
const addNoti_1 = require("../../utils/addNoti");
const constants_1 = require("../../constants");
const Screen_1 = require("../../entity/Screen");
class TheatreService {
    theatreRepo = data_source_1.AppDataSource.getRepository(Theatre_1.Theatre);
    screenRepo = data_source_1.AppDataSource.getRepository(Screen_1.Screen);
    async getTheatres(filter, search, page, limit, sortBy, sortOrder) {
        let active = filter === "active";
        let whereClause = {};
        if (filter && search) {
            whereClause = [
                { active, name: (0, typeorm_1.Like)(`%${search}%`) },
                { active, location: (0, typeorm_1.Like)(`%${search}%`) },
                { active, region: (0, typeorm_1.Like)(`%${search}%`) },
                { active, city: (0, typeorm_1.Like)(`%${search}%`) },
                { active, phoneNo: (0, typeorm_1.Like)(`%${search}%`) },
            ];
        }
        else if (filter) {
            whereClause = {
                active,
            };
        }
        else if (search) {
            whereClause = [
                { name: (0, typeorm_1.Like)(`%${search}%`) },
                { location: (0, typeorm_1.Like)(`%${search}%`) },
                { region: (0, typeorm_1.Like)(`%${search}%`) },
                { city: (0, typeorm_1.Like)(`%${search}%`) },
                { phoneNo: (0, typeorm_1.Like)(`%${search}%`) },
            ];
        }
        const [theatres, total] = await this.theatreRepo.findAndCount({
            relations: ["screens", "schedules"],
            order: {
                [sortBy]: sortOrder,
            },
            skip: (page - 1) * limit,
            take: limit,
            where: whereClause,
        });
        return {
            status: 200,
            data: theatres,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getTheatresByShowingMovie(movieId) {
        const today = (0, dayjs_1.default)().format("YYYY-MM-DD");
        const time = (0, dayjs_1.default)().format("HH:mm:ss");
        const theatres = await data_source_1.AppDataSource.getRepository(Theatre_1.Theatre)
            .createQueryBuilder("theatre")
            .innerJoin("theatre.schedules", "schedule")
            .innerJoin("schedule.movie", "movie")
            .where("movie.id = :movieId", { movieId })
            .andWhere(`((schedule.showDate = :today AND schedule.showTime >= :time) OR (schedule.showDate > :today))`, { today, time })
            .andWhere("theatre.active = 1")
            .distinct(true)
            .getMany();
        return {
            status: 200,
            data: theatres,
        };
    }
    async addTheatre(body, user) {
        const { name, location, city } = body;
        const existingLocation = await this.theatreRepo.findOneBy({
            location,
            city,
        });
        if (existingLocation) {
            throw new Error("Branch location already exists.");
        }
        const newTheatre = this.theatreRepo.create({
            ...body,
            totalScreens: 0,
            active: true,
        });
        const theatre = await this.theatreRepo.save(newTheatre);
        const message = `${user.name} added ${theatre.location} branch.`;
        (0, addNoti_1.addNotification)(constants_1.NOTI_TYPE.THEATRE_ADDED, "Theatre Added", message, user.id, theatre?.id);
        return {
            status: 200,
            message: "Branch added successfully",
            data: newTheatre,
        };
    }
    async updateTheatre(TheatreId, body, user) {
        const { name, location } = body;
        const existingTheatreById = await this.theatreRepo.findOneBy({
            id: TheatreId,
        });
        if (!existingTheatreById) {
            return {
                status: 404,
                message: "Theatre not found.",
            };
        }
        const existingTheatreByLocation = await this.theatreRepo.findOneBy({
            location,
        });
        if (existingTheatreByLocation &&
            existingTheatreByLocation.id !== TheatreId) {
            return {
                status: 400,
                message: "Branch location already exists.",
            };
        }
        const updatedTheatre = { ...existingTheatreById, ...body };
        const saved = await this.theatreRepo.save(updatedTheatre);
        const message = `${user.name} updated ${saved.name} branch details.`;
        (0, addNoti_1.addNotification)(constants_1.NOTI_TYPE.THEATRE_UPDATED, "Theatre Updated", message, user.id, existingTheatreById?.id);
        return {
            status: 200,
            message: "Branch updated successfully.",
            data: saved,
        };
    }
    async deleteTheatre(theatreId, user) {
        const theatre = await this.theatreRepo.findOneBy({ id: theatreId });
        const status = theatre.active;
        if (!theatre) {
            return {
                status: 404,
                message: "Branch not found",
            };
        }
        await this.theatreRepo.save({ ...theatre, active: !theatre.active });
        const screens = await this.screenRepo.find({
            relations: ["theatre"],
            where: { theatre: { id: theatreId } },
        });
        screens.map((screen) => {
            screen.active = !status;
            this.screenRepo.save(screen);
        });
        const message = `${user.name} ${status === true ? "deactivated" : "activated"} ${theatre.location} branch and its screens.`;
        (0, addNoti_1.addNotification)(theatre.active
            ? constants_1.NOTI_TYPE.THEATRE_DEACTIVATED
            : constants_1.NOTI_TYPE.THEATRE_ACTIVATED, `Branch ${theatre.active ? "Deactivated" : "Activated"}`, message, user.id, theatre?.id);
        return {
            status: 200,
            message: `Branch and its screens ${theatre.active ? "deactiveated" : "activated"} successfully.`,
        };
    }
}
exports.TheatreService = TheatreService;
//# sourceMappingURL=theatre.service.js.map