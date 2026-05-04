"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleService = void 0;
const data_source_1 = require("../../data-source");
const Schedule_1 = require("../../entity/Schedule");
const SeatType_1 = require("../../entity/SeatType");
class ScheduleService {
    scheduleRepo = data_source_1.AppDataSource.getRepository(Schedule_1.Schedule);
    seatTypeRepo = data_source_1.AppDataSource.getRepository(SeatType_1.SeatType);
    async getScheduleDetail(scheduleId) {
        const schedule = await this.scheduleRepo.findOne({
            relations: [
                "movie",
                "theatre",
                "screen",
                "screen.seatTypes",
                "screen.seatTypes.seatType",
            ],
            where: { id: scheduleId },
        });
        const seatTypes = await this.seatTypeRepo.find();
        const seatTypeList = seatTypes.map((item) => {
            const price = item.price * schedule.multiplier * schedule.screen.multiplier;
            return {
                ...item,
                price: parseFloat(price.toString()).toFixed(2),
            };
        });
        return {
            data: {
                ...schedule,
                priceList: seatTypeList,
            },
            status: 200,
        };
    }
}
exports.ScheduleService = ScheduleService;
//# sourceMappingURL=schedule.service.js.map