import express from "express";
import { validateDto } from "../middlewares/validateReqBody";
import { accessAsAdmin } from "../middlewares/auth.middleware";
import {
  addSeatType,
  deleteSeatType,
  getSeatTypes,
  updateSeatType,
} from "../controllers/seatType.controller";
import { CreateSeatTypeDto } from "../dtos/seatType.dto";

const router = express.Router();

router.get("/seat-types", getSeatTypes);
router.post(
  "/seat-types",
  accessAsAdmin,
  validateDto(CreateSeatTypeDto),
  addSeatType,
);
router.put(
  "/seat-types/:id",
  accessAsAdmin,
  validateDto(CreateSeatTypeDto),
  updateSeatType,
);
router.delete("/seat-types/:id", accessAsAdmin, deleteSeatType);

export default router;
