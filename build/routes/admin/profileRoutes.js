"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const profile_controller_1 = require("../../controllers/admin.controllers/profile.controller");
const multer_1 = require("../../config/multer");
const router = express_1.default.Router();
router.put("/profile/update/:id", auth_middleware_1.protect, multer_1.upload.fields([{ name: "image", maxCount: 1 }]), profile_controller_1.updateProfile);
router.put("/profile/change-password/:id", auth_middleware_1.protect, profile_controller_1.changePassword);
exports.default = router;
//# sourceMappingURL=profileRoutes.js.map