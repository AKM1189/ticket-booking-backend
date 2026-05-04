"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const movie_controller_1 = require("../../controllers/admin.controllers/movie.controller");
const validateReqBody_1 = require("../../middlewares/validateReqBody");
const movie_dto_1 = require("../../dtos/movie.dto");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const multer_1 = require("../../config/multer");
const router = express_1.default.Router();
router.get("/movies/showing/list", auth_middleware_1.accessAsAdmin, movie_controller_1.getShowingMovies);
router.get("/movies", movie_controller_1.getMovies);
router.get("/movies/all", movie_controller_1.getAllMovies);
router.get("/movies/:id", movie_controller_1.getMovieById);
router.post("/movies", auth_middleware_1.accessAsAdmin, multer_1.upload.fields([
    { name: "poster", maxCount: 1 },
    { name: "photos[]", maxCount: 10 },
]), (0, validateReqBody_1.validateDto)(movie_dto_1.CreateMovieDto), movie_controller_1.addMovie);
router.put("/movies/:id", auth_middleware_1.accessAsAdmin, multer_1.upload.fields([
    { name: "poster", maxCount: 1 },
    { name: "photos[]", maxCount: 10 },
]), (0, validateReqBody_1.validateDto)(movie_dto_1.CreateMovieDto), movie_controller_1.updateMovie);
router.delete("/movies/:id", auth_middleware_1.accessAsAdmin, movie_controller_1.deleteMovie);
exports.default = router;
//# sourceMappingURL=movieRoutes.js.map