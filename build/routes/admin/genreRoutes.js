"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const genre_controller_1 = require("../../controllers/admin.controllers/genre.controller");
const validateReqBody_1 = require("../../middlewares/validateReqBody");
const genre_dto_1 = require("../../dtos/genre.dto");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = express_1.default.Router();
router.get("/genres", genre_controller_1.getGenre);
router.get("/genres/all", genre_controller_1.getAllGenre);
router.get("/genres/:id", genre_controller_1.getGenreById);
router.post("/genres", auth_middleware_1.accessAsAdmin, (0, validateReqBody_1.validateDto)(genre_dto_1.CreateGenreDto), genre_controller_1.addGenre);
router.put("/genres/:id", auth_middleware_1.accessAsAdmin, (0, validateReqBody_1.validateDto)(genre_dto_1.CreateGenreDto), genre_controller_1.updateGenre);
router.delete("/genres/:id", auth_middleware_1.accessAsAdmin, genre_controller_1.deleteGenre);
exports.default = router;
//# sourceMappingURL=genreRoutes.js.map