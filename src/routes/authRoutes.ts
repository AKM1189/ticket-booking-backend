import express from "express";
import { validateDto } from "../middlewares/validateReqBody";
import { CreateUserDto } from "../dtos/user.dto";
import {
  getUserProfile,
  login,
  register,
} from "../controllers/auth.controller";
import { protect } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/register", validateDto(CreateUserDto), register);
router.post("/login", login);
router.get("/me", protect, getUserProfile);

export default router;
