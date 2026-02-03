import express from "express";
import { validateDto } from "../../middlewares/validateReqBody";
import { accessAsAdmin } from "../../middlewares/auth.middleware";
import {
  addCast,
  deleteCast,
  getAllCast,
  getCast,
  getCastById,
  updateCast,
} from "../../controllers/admin.controllers/cast.controller";
import { CreateCastDto } from "../../dtos/cast.dto";
import { upload } from "../../config/multer";

const router = express.Router();

router.get("/casts/all", getAllCast);
router.get("/casts", getCast);
router.get("/casts/:id", getCastById);
router.post(
  "/casts",
  accessAsAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  validateDto(CreateCastDto),
  addCast,
);
router.put(
  "/casts/:id",
  accessAsAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  validateDto(CreateCastDto),
  updateCast,
);
router.delete("/casts/:id", accessAsAdmin, deleteCast);

export default router;
