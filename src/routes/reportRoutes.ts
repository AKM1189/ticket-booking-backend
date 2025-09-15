import express from "express";
import {
  getCardInfo,
  getRecentRecords,
} from "../controllers/report.controller";
import { accessAsAdmin } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/dashboard/info", accessAsAdmin, getCardInfo);
router.get("/dashboard/upcoming-schedule", accessAsAdmin, getRecentRecords);

export default router;
