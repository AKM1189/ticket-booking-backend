import express from "express";

import { validateDto } from "../../middlewares/validateReqBody";
import { CreateGenreDto } from "../../dtos/genre.dto";
import { accessAsAdmin, protect } from "../../middlewares/auth.middleware";
import {
  addBooking,
  cancelBooking,
  getBookingById,
  getBookings,
} from "../../controllers/admin.controllers/boooking.controller";

const router = express.Router();

router.get("/bookings", getBookings);
router.get("/bookings/:id", protect, getBookingById);
router.post("/bookings", accessAsAdmin, protect, addBooking);
router.delete("/bookings/:id", accessAsAdmin, cancelBooking);

export default router;
