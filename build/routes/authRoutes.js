"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validateReqBody_1 = require("../middlewares/validateReqBody");
const user_dto_1 = require("../dtos/user.dto");
const auth_controller_1 = require("../controllers/admin.controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.post("/register", (0, validateReqBody_1.validateDto)(user_dto_1.CreateUserDto), auth_controller_1.register);
router.post("/login", auth_controller_1.login);
router.post("/logout", auth_controller_1.logout);
router.get("/user/me", auth_middleware_1.protect, auth_controller_1.getUserProfile);
router.get("/admin/me", auth_middleware_1.accessAsAdmin, auth_controller_1.getAdminProfile);
router.get("/refresh", auth_controller_1.refreshAccessToken);
router.post("/forgot-password", auth_controller_1.forgotPasssword);
router.post("/verifyOtp", auth_controller_1.verifyOtp);
router.post("/reset-password", auth_controller_1.resetPassword);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map