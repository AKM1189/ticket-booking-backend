import express from "express";

import { validateDto } from "../middlewares/validateReqBody";
import { CreateGenreDto } from "../dtos/genre.dto";
import { accessAsAdmin, protect } from "../middlewares/auth.middleware";
import {
  addBooking,
  cancelBooking,
  getBookingById,
  getBookings,
} from "../controllers/boooking.controller";

const router = express.Router();

router.get("/bookings", getBookings);
router.get("/bookings/:id", getBookingById);
router.post("/bookings", accessAsAdmin, addBooking);
router.delete("/bookings/:id", accessAsAdmin, cancelBooking);

export default router;
