import express from "express";
import { protect } from "../middlewares/auth.middleware";
import {
  getNotifications,
  readAllNoti,
  readNoti,
} from "../controllers/notification.controller";

const router = express.Router();

router.get("/notifications", protect, getNotifications);
router.put("/notifications/:id", protect, readNoti);
router.put("/notifications/all", protect, readAllNoti);

export default router;
