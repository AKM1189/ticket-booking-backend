import express from "express";
import {
  addGenre,
  deleteGenre,
  getGenre,
  getGenreById,
  updateGenre,
} from "../controllers/genre.controller";

const router = express.Router();

router.get("/genres", getGenre);
router.get("/genres/:id", getGenreById);
router.post("/genres", addGenre);
router.put("/genres/:id", updateGenre);
router.delete("/genres/:id", deleteGenre);

export default router;
