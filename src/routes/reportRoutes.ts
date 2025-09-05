import express from "express";
import {
  getCardInfo,
  getRecentRecords,
} from "../controllers/report.controller";

const router = express.Router();

router.get("/dashboard/info", getCardInfo);
router.get("/dashboard/upcoming-schedule", getRecentRecords);

export default router;
