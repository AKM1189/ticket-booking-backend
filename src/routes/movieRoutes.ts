import express from "express";
import {
  addMovie,
  deleteMovie,
  getMovieById,
  getMovies,
  updateMovie,
} from "../controllers/movie.controller";

const router = express.Router();

router.get("/movies", getMovies);
router.get("/movies/:id", getMovieById);
router.post("/movies", addMovie);
router.put("/movies/:id", updateMovie);
router.delete("/movies/:id", deleteMovie);

export default router;
