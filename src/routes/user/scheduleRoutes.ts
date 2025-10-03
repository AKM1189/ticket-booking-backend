import express from "express";
import { getScheduleDetail } from "../../controllers/user.controllers/schedule.controller";
const router = express.Router();

router.get("/schedules/:id", getScheduleDetail);

export default router;
