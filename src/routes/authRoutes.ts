import express from "express";
import { validateDto } from "../middlewares/validateReqBody";
import { CreateUserDto } from "../dtos/user.dto";
import {
  forgotPasssword,
  getAdminProfile,
  getUserProfile,
  login,
  logout,
  refreshAccessToken,
  register,
  resetPassword,
  verifyOtp,
} from "../controllers/admin.controllers/auth.controller";
import { accessAsAdmin, protect } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/register", validateDto(CreateUserDto), register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/user/me", protect, getUserProfile);
router.get("/admin/me", accessAsAdmin, getAdminProfile);
router.get("/refresh", refreshAccessToken);
router.post("/forgot-password", forgotPasssword);
router.post("/verifyOtp", verifyOtp);
router.post("/reset-password", resetPassword);

export default router;
