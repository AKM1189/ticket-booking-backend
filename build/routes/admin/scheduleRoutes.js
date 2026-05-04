"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const schedule_controller_1 = require("../../controllers/admin.controllers/schedule.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = express_1.default.Router();
router.get("/schedules", auth_middleware_1.accessAsAdmin, schedule_controller_1.getSchedules);
router.get("/schedules/showDate", schedule_controller_1.getShowDate);
router.get("/schedules/showTime", schedule_controller_1.getShowTime);
router.get("/schedules/show-details", schedule_controller_1.getScheduleByShowDetail);
router.post("/schedules", auth_middleware_1.accessAsAdmin, schedule_controller_1.addSchedule);
router.put("/schedules/:id", auth_middleware_1.accessAsAdmin, 
//   validateDto(CreateGenreDto),
schedule_controller_1.updateSchedule);
router.delete("/schedules/:id", auth_middleware_1.accessAsAdmin, schedule_controller_1.deleteSchedule);
exports.default = router;
//# sourceMappingURL=scheduleRoutes.js.map