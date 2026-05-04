"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const report_controller_1 = require("../../controllers/admin.controllers/report.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = express_1.default.Router();
router.get("/dashboard/info", auth_middleware_1.accessAsAdmin, report_controller_1.getCardInfo);
router.get("/dashboard/upcoming-schedule", auth_middleware_1.accessAsAdmin, report_controller_1.getRecentRecords);
exports.default = router;
//# sourceMappingURL=reportRoutes.js.map