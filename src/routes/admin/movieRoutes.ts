import express from "express";
import {
  addMovie,
  deleteMovie,
  getAllMovies,
  getMovieById,
  getMovies,
  getShowingMovies,
  updateMovie,
} from "../../controllers/admin.controllers/movie.controller";
import { validateDto } from "../../middlewares/validateReqBody";
import { CreateMovieDto } from "../../dtos/movie.dto";
import { accessAsAdmin } from "../../middlewares/auth.middleware";
import { upload } from "../../config/multer";

const router = express.Router();

router.get("/movies/showing/list", accessAsAdmin, getShowingMovies);

router.get("/movies", getMovies);
router.get("/movies/all", getAllMovies);
router.get("/movies/:id", getMovieById);

router.post(
  "/movies",
  accessAsAdmin,
  upload.fields([
    { name: "poster", maxCount: 1 },
    { name: "photos[]", maxCount: 10 },
  ]),
  validateDto(CreateMovieDto),
  addMovie,
);
router.put(
  "/movies/:id",
  accessAsAdmin,
  upload.fields([
    { name: "poster", maxCount: 1 },
    { name: "photos[]", maxCount: 10 },
  ]),
  validateDto(CreateMovieDto),
  updateMovie,
);

router.delete("/movies/:id", accessAsAdmin, deleteMovie);

export default router;
