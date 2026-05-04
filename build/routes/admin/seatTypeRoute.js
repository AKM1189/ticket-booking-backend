"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validateReqBody_1 = require("../../middlewares/validateReqBody");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const seatType_controller_1 = require("../../controllers/admin.controllers/seatType.controller");
const seatType_dto_1 = require("../../dtos/seatType.dto");
const router = express_1.default.Router();
router.get("/seat-types", seatType_controller_1.getSeatTypes);
router.post("/seat-types", auth_middleware_1.accessAsAdmin, (0, validateReqBody_1.validateDto)(seatType_dto_1.CreateSeatTypeDto), seatType_controller_1.addSeatType);
router.put("/seat-types/:id", auth_middleware_1.accessAsAdmin, (0, validateReqBody_1.validateDto)(seatType_dto_1.CreateSeatTypeDto), seatType_controller_1.updateSeatType);
router.delete("/seat-types/:id", auth_middleware_1.accessAsAdmin, seatType_controller_1.deleteSeatType);
exports.default = router;
//# sourceMappingURL=seatTypeRoute.js.map