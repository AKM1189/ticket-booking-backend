import express from "express";

import { protect } from "../../middlewares/auth.middleware";
import {
  changePassword,
  updateProfile,
} from "../../controllers/admin.controllers/profile.controller";
import { upload } from "../../config/multer";

const router = express.Router();

router.put(
  "/profile/update/:id",
  protect,
  upload.fields([{ name: "image", maxCount: 1 }]),
  updateProfile,
);

router.put("/profile/change-password/:id", protect, changePassword);

export default router;
