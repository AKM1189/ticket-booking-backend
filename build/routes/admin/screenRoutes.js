"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validateReqBody_1 = require("../../middlewares/validateReqBody");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const screen_controller_1 = require("../../controllers/admin.controllers/screen.controller");
const screen_dto_1 = require("../../dtos/screen.dto");
const router = express_1.default.Router();
router.get("/screens", screen_controller_1.getScreen);
router.get("/screens/all", screen_controller_1.getScreenByTheatre);
router.get("/screens/showing", screen_controller_1.getScreenByShow);
// router.get("/genres/:id", getGenreById);
router.post("/screens", auth_middleware_1.accessAsAdmin, (0, validateReqBody_1.validateDto)(screen_dto_1.CreateScreenDto), screen_controller_1.addScreen);
router.put("/screens/:id", auth_middleware_1.accessAsAdmin, (0, validateReqBody_1.validateDto)(screen_dto_1.CreateScreenDto), screen_controller_1.updateScreen);
router.delete("/screens/:id", auth_middleware_1.accessAsAdmin, screen_controller_1.deleteScreen);
exports.default = router;
//# sourceMappingURL=screenRoutes.js.map