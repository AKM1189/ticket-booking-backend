import express from "express";
import {
  addGenre,
  deleteGenre,
  getGenre,
  getGenreById,
  updateGenre,
} from "../controllers/genre.controller";
import { validateDto } from "../middlewares/validateReqBody";
import { CreateGenreDto } from "../dtos/genre.dto";
import { protect } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/genres", protect, getGenre);
router.get("/genres/:id", getGenreById);
router.post("/genres", validateDto(CreateGenreDto), addGenre);
router.put("/genres/:id", updateGenre);
router.delete("/genres/:id", deleteGenre);

export default router;
