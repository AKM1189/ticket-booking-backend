"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const notification_controller_1 = require("../../controllers/admin.controllers/notification.controller");
const router = express_1.default.Router();
router.get("/notifications/:type", auth_middleware_1.protect, notification_controller_1.getNotifications);
router.patch("/notifications/all", auth_middleware_1.protect, notification_controller_1.readAllNoti);
router.patch("/notifications/:id", auth_middleware_1.protect, notification_controller_1.readNoti);
exports.default = router;
//# sourceMappingURL=notiRoutes.js.map