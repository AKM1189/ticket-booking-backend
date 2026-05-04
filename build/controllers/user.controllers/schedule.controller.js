"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScheduleDetail = void 0;
const schedule_service_1 = require("../../services/user.service/schedule.service");
const scheduleService = new schedule_service_1.ScheduleService();
const getScheduleDetail = async (req, res) => {
    try {
        const scheduleId = parseInt(req.params.id);
        console.log("scheduleId", scheduleId);
        const { data, status } = await scheduleService.getScheduleDetail(scheduleId);
        res.status(status).json({ data });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getScheduleDetail = getScheduleDetail;
//# sourceMappingURL=schedule.controller.js.map