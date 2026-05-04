"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validateReqBody_1 = require("../../middlewares/validateReqBody");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const theatre_controller_1 = require("../../controllers/admin.controllers/theatre.controller");
const theatre_dto_1 = require("../../dtos/theatre.dto");
const router = express_1.default.Router();
router.get("/theatres", theatre_controller_1.getTheatre);
router.get("/theatres/all", theatre_controller_1.getAllTheatres);
router.get("/theatres/:id", theatre_controller_1.getTheatreById);
router.get("/movie/schedules/theatres", theatre_controller_1.getTheatreByShowingMovie);
router.post("/theatres", auth_middleware_1.accessAsAdmin, (0, validateReqBody_1.validateDto)(theatre_dto_1.CreateTheatreDto), theatre_controller_1.addTheatre);
router.put("/theatres/:id", auth_middleware_1.accessAsAdmin, (0, validateReqBody_1.validateDto)(theatre_dto_1.CreateTheatreDto), theatre_controller_1.updateTheatre);
router.delete("/theatres/:id", auth_middleware_1.accessAsAdmin, theatre_controller_1.deleteTheatre);
exports.default = router;
//# sourceMappingURL=theatreRoutes.js.map