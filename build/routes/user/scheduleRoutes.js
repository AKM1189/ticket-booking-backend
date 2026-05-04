"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const schedule_controller_1 = require("../../controllers/user.controllers/schedule.controller");
const router = express_1.default.Router();
router.get("/schedules/:id", schedule_controller_1.getScheduleDetail);
exports.default = router;
//# sourceMappingURL=scheduleRoutes.js.map