import express from "express";
import { validateDto } from "../../middlewares/validateReqBody";
import { accessAsAdmin, protect } from "../../middlewares/auth.middleware";
import {
  addCast,
  deleteCast,
  getAllCast,
  getCast,
  getCastById,
  updateCast,
} from "../../controllers/admin.controllers/cast.controller";
import { CreateCastDto } from "../../dtos/cast.dto";
import multer from "multer";
import fs from "fs";

const router = express.Router();

// const uploadDir = "uploads";
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

// Configure multer (can be moved to a separate file)
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads/"),
//   filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
// });
// const upload = multer({ storage });

router.get("/casts/all", getAllCast);
router.get("/casts", getCast);
router.get("/casts/:id", getCastById);
router.post(
  "/casts",
  accessAsAdmin,
  // imgUpload.fields([{ name: "image", maxCount: 1 }]),
  // upload.fields([
  //   { name: "image", maxCount: 1 },
  // ]),
  validateDto(CreateCastDto),
  addCast,
);
router.put(
  "/casts/:id",
  accessAsAdmin,
  // imgUpload.fields([{ name: "image", maxCount: 1 }]),
  // upload.fields([
  //   { name: "image", maxCount: 1 },
  // ]),
  validateDto(CreateCastDto),
  updateCast,
);
router.delete("/casts/:id", accessAsAdmin, deleteCast);

export default router;
