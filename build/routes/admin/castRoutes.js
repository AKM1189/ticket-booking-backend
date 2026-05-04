"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validateReqBody_1 = require("../../middlewares/validateReqBody");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const cast_controller_1 = require("../../controllers/admin.controllers/cast.controller");
const cast_dto_1 = require("../../dtos/cast.dto");
const multer_1 = require("../../config/multer");
const router = express_1.default.Router();
router.get("/casts/all", cast_controller_1.getAllCast);
router.get("/casts", cast_controller_1.getCast);
router.get("/casts/:id", cast_controller_1.getCastById);
router.post("/casts", auth_middleware_1.accessAsAdmin, multer_1.upload.fields([{ name: "image", maxCount: 1 }]), (0, validateReqBody_1.validateDto)(cast_dto_1.CreateCastDto), cast_controller_1.addCast);
router.put("/casts/:id", auth_middleware_1.accessAsAdmin, multer_1.upload.fields([{ name: "image", maxCount: 1 }]), (0, validateReqBody_1.validateDto)(cast_dto_1.CreateCastDto), cast_controller_1.updateCast);
router.delete("/casts/:id", auth_middleware_1.accessAsAdmin, cast_controller_1.deleteCast);
exports.default = router;
//# sourceMappingURL=castRoutes.js.map