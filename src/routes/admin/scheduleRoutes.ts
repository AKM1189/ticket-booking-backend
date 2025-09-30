import express from "express";
import {
  addSchedule,
  deleteSchedule,
  getSchedule,
  getScheduleByShowDetail,
  getShowDate,
  getShowTime,
  updateSchedule,
} from "../../controllers/admin.controllers/schedule.controller";
import { accessAsAdmin } from "../../middlewares/auth.middleware";

const router = express.Router();

router.get("/schedules", accessAsAdmin, getSchedule);
router.get("/schedules/showDate", getShowDate);
router.get("/schedules/showTime", getShowTime);
router.get("/schedules/show-details", getScheduleByShowDetail);
router.post("/schedules", accessAsAdmin, addSchedule);
router.put(
  "/schedules/:id",
  accessAsAdmin,
  //   validateDto(CreateGenreDto),
  updateSchedule,
);
router.delete("/schedules/:id", accessAsAdmin, deleteSchedule);

export default router;
