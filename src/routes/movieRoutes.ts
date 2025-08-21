import express from "express";
import {
  addMovie,
  deleteMovie,
  getMovieById,
  getMovies,
  updateMovie,
} from "../controllers/movie.controller";
import { validateDto } from "../middlewares/validateReqBody";
import { CreateMovieDto } from "../dtos/movie.dto";
import multer from "multer";
import fs from "fs";
import { accessAsAdmin, protect } from "../middlewares/auth.middleware";
import { imgUpload } from "../middlewares/imgUpload";

const router = express.Router();

// const uploadDir = "uploads";
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

// // Configure multer (can be moved to a separate file)
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads/"),
//   filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
// });
// const upload = multer({ storage });

router.get("/movies", getMovies);
router.get("/movies/:id", getMovieById);

router.post(
  "/movies",
  accessAsAdmin,
  imgUpload.fields([
    { name: "poster", maxCount: 1 },
    { name: "photos[]", maxCount: 5 },
  ]),
  validateDto(CreateMovieDto),
  addMovie,
);
router.put(
  "/movies/:id",
  accessAsAdmin,
  imgUpload.fields([
    { name: "poster", maxCount: 1 },
    { name: "photos[]", maxCount: 5 },
  ]),
  validateDto(CreateMovieDto),
  updateMovie,
);

router.delete("/movies/:id", accessAsAdmin, deleteMovie);

export default router;
