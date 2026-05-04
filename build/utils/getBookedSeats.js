"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookedSeats = void 0;
const data_source_1 = require("../data-source");
const Schedule_1 = require("../entity/Schedule");
const getBookedSeats = async (scheduleId) => {
    const scheduleRepo = data_source_1.AppDataSource.getRepository(Schedule_1.Schedule);
    const schedule = await scheduleRepo.findOne({
        where: { id: scheduleId },
    });
    return schedule?.bookedSeats;
};
exports.getBookedSeats = getBookedSeats;
//# sourceMappingURL=getBookedSeats.js.map