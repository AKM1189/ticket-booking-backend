import express from "express";
import { protect } from "../../middlewares/auth.middleware";
import {
  getNotifications,
  readAllNoti,
  readNoti,
} from "../../controllers/admin.controllers/notification.controller";

const router = express.Router();

router.get("/notifications/:type", protect, getNotifications);
router.patch("/notifications/all", protect, readAllNoti);
router.patch("/notifications/:id", protect, readNoti);

export default router;
