"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const boooking_controller_1 = require("../../controllers/admin.controllers/boooking.controller");
const router = express_1.default.Router();
router.get("/user/bookings/:id", boooking_controller_1.getBookingByUserId);
router.get("/bookings", boooking_controller_1.getBookings);
router.get("/bookings/:id", auth_middleware_1.protect, boooking_controller_1.getBookingById);
router.post("/bookings", auth_middleware_1.protect, boooking_controller_1.addBooking);
router.post("/bookings/:id", auth_middleware_1.protect, boooking_controller_1.cancelBooking);
exports.default = router;
//# sourceMappingURL=bookingRoutes.js.map