import express from "express";
import { protect } from "../../middlewares/auth.middleware";
import {
  addReview,
  deleteReview,
  updateReview,
} from "../../controllers/admin.controllers/review.controller";

const router = express.Router();
router.post("/reviews", protect, addReview);
router.put("/reviews/:id", protect, updateReview);
router.delete("/reviews/:id", protect, deleteReview);

export default router;
