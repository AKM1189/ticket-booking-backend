import { ScheduleService } from "../../services/user.service/schedule.service";
import { Request, Response } from "express";

const scheduleService = new ScheduleService();

export const getScheduleDetail = async (req: Request, res: Response) => {
  try {
    const scheduleId = parseInt(req.params.id as string);
    console.log("scheduleId", scheduleId);
    const { data, status } = await scheduleService.getScheduleDetail(
      scheduleId,
    );

    res.status(status).json({ data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
