import express from "express";
import {
  addGenre,
  deleteGenre,
  getAllGenre,
  getGenre,
  getGenreById,
  updateGenre,
} from "../controllers/genre.controller";
import { validateDto } from "../middlewares/validateReqBody";
import { CreateGenreDto } from "../dtos/genre.dto";
import { accessAsAdmin, protect } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/genres", getGenre);
router.get("/genres/all", getAllGenre);
router.get("/genres/:id", getGenreById);
router.post("/genres", accessAsAdmin, validateDto(CreateGenreDto), addGenre);
router.put(
  "/genres/:id",
  accessAsAdmin,
  validateDto(CreateGenreDto),
  updateGenre,
);
router.delete("/genres/:id", accessAsAdmin, deleteGenre);

export default router;
