"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const movie_controller_1 = require("../../controllers/user.controllers/movie.controller");
const router = express_1.default.Router();
router.get("/movies/filter-list", movie_controller_1.getFilterList);
router.get("/movies/search/filters", movie_controller_1.getSearchFilters);
router.get("/movies/search/movie-list", movie_controller_1.getSearchMovies);
router.get("/movies/shows", movie_controller_1.getShowTimeAndLocation);
router.get("/movies", movie_controller_1.getAllMovies);
router.get("/movies/:id", movie_controller_1.getMovieDetail);
exports.default = router;
//# sourceMappingURL=movieRoutes.js.map