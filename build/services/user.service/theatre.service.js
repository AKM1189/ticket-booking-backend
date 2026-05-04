"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TheatreService = void 0;
const data_source_1 = require("../../data-source");
const Theatre_1 = require("../../entity/Theatre");
const dayjs_1 = __importDefault(require("dayjs"));
const ScheduleType_1 = require("../../types/ScheduleType");
class TheatreService {
    theatreRepo = data_source_1.AppDataSource.getRepository(Theatre_1.Theatre);
    async getShowingTheatres() {
        const today = (0, dayjs_1.default)().format("YYYY-MM-DD");
        const maxDay = (0, dayjs_1.default)().add(4, "day").format("YYYY-MM-DD");
        const theatres = await this.theatreRepo
            .createQueryBuilder("theatre")
            .innerJoin("theatre.schedules", "schedule")
            .innerJoin("schedule.movie", "movie")
            .andWhere(`(schedule.showDate >= :today AND schedule.showDate <= :maxDay)`, { today, maxDay })
            .andWhere("schedule.status NOT IN (:...status)", {
            status: [ScheduleType_1.ScheduleStatus.inActive, ScheduleType_1.ScheduleStatus.completed],
        })
            .andWhere("theatre.active = 1")
            .distinct(true)
            .getMany();
        return {
            status: 200,
            data: theatres,
        };
    }
}
exports.TheatreService = TheatreService;
//# sourceMappingURL=theatre.service.js.map