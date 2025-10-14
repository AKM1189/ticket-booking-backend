import express from "express";

import { validateDto } from "../../middlewares/validateReqBody";
import { CreateGenreDto } from "../../dtos/genre.dto";
import { accessAsAdmin, protect } from "../../middlewares/auth.middleware";
import {
  addBooking,
  cancelBooking,
  getBookingById,
  getBookingByUserId,
  getBookings,
} from "../../controllers/admin.controllers/boooking.controller";

const router = express.Router();

router.get("/user/bookings/:id", getBookingByUserId);
router.get("/bookings", getBookings);
router.get("/bookings/:id", protect, getBookingById);
router.post("/bookings", protect, addBooking);
router.post("/bookings/:id", protect, cancelBooking);

export default router;
