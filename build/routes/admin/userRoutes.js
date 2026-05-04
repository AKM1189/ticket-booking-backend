"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const user_controller_1 = require("../../controllers/admin.controllers/user.controller");
const user_dto_1 = require("../../dtos/user.dto");
const validateReqBody_1 = require("../../middlewares/validateReqBody");
const router = express_1.default.Router();
router.get("/users", auth_middleware_1.accessAsAdmin, user_controller_1.getUsers);
// router.get("/genres/:id", getGenreById);
router.post("/users", auth_middleware_1.accessAsAdmin, (0, validateReqBody_1.validateDto)(user_dto_1.CreateAdminDto), user_controller_1.addAdmin);
router.put("/users/:id", auth_middleware_1.accessAsAdmin, (0, validateReqBody_1.validateDto)(user_dto_1.CreateAdminDto), user_controller_1.updateUser);
router.delete("/users/:id", auth_middleware_1.accessAsAdmin, user_controller_1.deactivateUser);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map