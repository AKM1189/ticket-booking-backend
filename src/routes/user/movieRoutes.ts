import express from "express";
import {
  getAllMovies,
  getFilterList,
  getMovieDetail,
  getSearchFilters,
  getSearchMovies,
  getShowTimeAndLocation,
} from "../../controllers/user.controllers/movie.controller";
const router = express.Router();

router.get("/movies/filter-list", getFilterList);
router.get("/movies/shows", getShowTimeAndLocation);
router.get("/movies", getAllMovies);
router.get("/movies/:id", getMovieDetail);
router.get("/movies/search/filters", getSearchFilters);
router.get("/movies/search/movie-list", getSearchMovies);

export default router;
