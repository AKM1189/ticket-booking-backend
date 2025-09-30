import express from "express";
import { validateDto } from "../../middlewares/validateReqBody";
import { accessAsAdmin } from "../../middlewares/auth.middleware";
import {
  addTheatre,
  deleteTheatre,
  getAllTheatres,
  getTheatre,
  getTheatreById,
  getTheatreByShowingMovie,
  updateTheatre,
} from "../../controllers/admin.controllers/theatre.controller";
import { CreateTheatreDto } from "../../dtos/theatre.dto";

const router = express.Router();

router.get("/theatres", getTheatre);
router.get("/theatres/all", getAllTheatres);
router.get("/theatres/:id", getTheatreById);
router.get("/movie/schedules/theatres", getTheatreByShowingMovie);
router.post(
  "/theatres",
  accessAsAdmin,
  validateDto(CreateTheatreDto),
  addTheatre,
);
router.put(
  "/theatres/:id",
  accessAsAdmin,
  validateDto(CreateTheatreDto),
  updateTheatre,
);
router.delete("/theatres/:id", accessAsAdmin, deleteTheatre);

export default router;
