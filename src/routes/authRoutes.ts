import express from "express";
import { validateDto } from "../middlewares/validateReqBody";
import { CreateUserDto } from "../dtos/user.dto";
import {
  forgotPasssword,
  getUserProfile,
  login,
  refreshAccessToken,
  register,
  resetPassword,
  verifyOtp,
} from "../controllers/auth.controller";
import { protect } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/register", validateDto(CreateUserDto), register);
router.post("/login", login);
router.get("/me", protect, getUserProfile);
router.get("/refresh", refreshAccessToken);
router.post("/forgot-password", forgotPasssword);
router.post("/verifyOtp", verifyOtp);
router.post("/reset-password", resetPassword);

export default router;
