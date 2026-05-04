"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const review_controller_1 = require("../../controllers/admin.controllers/review.controller");
const router = express_1.default.Router();
router.post("/reviews", auth_middleware_1.protect, review_controller_1.addReview);
router.put("/reviews/:id", auth_middleware_1.protect, review_controller_1.updateReview);
router.delete("/reviews/:id", auth_middleware_1.protect, review_controller_1.deleteReview);
exports.default = router;
//# sourceMappingURL=reviewRoutes.js.map