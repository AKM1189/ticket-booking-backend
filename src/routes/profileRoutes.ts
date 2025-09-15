import express from "express";

import fs from "fs";
import { accessAsAdmin } from "../middlewares/auth.middleware";
import { imgUpload } from "../middlewares/imgUpload";
import {
  changePassword,
  updateProfile,
} from "../controllers/profile.controller";

const router = express.Router();

// const uploadDir = "uploads";
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

router.put(
  "/profile/update/:id",
  accessAsAdmin,
  imgUpload.fields([{ name: "image", maxCount: 1 }]),
  updateProfile,
);

router.put("/profile/change-password/:id", accessAsAdmin, changePassword);

export default router;
