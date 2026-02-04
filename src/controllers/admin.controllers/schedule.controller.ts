import { ScheduleService } from "../../services/admin.service/schedule.service";
import { Request, Response } from "express";
import { getQueryParams } from "../../utils/queryParams";

const scheduleService = new ScheduleService();

export const getSchedules = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { page, limit, sortBy, sortOrder, search } = getQueryParams(
      req,
      1,
      10,
      "id",
    );
    const date = req.query.date as string;

    const { status, data, pagination } = await scheduleService.getSchedule(
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      date,
      user,
    );

    res.status(status).json({
      data,
      pagination,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getScheduleByShowDetail = async (req: Request, res: Response) => {
  try {
    const movieId = req.query.movieId as string;
    const theatreId = req.query.theatreId as string;
    const screenId = req.query.screenId as string;
    const showDate = req.query.showDate as string;
    const showTime = req.query.showTime as string;
    const { status, data } = await scheduleService.getScheduleByShowDetail(
      movieId,
      theatreId,
      screenId,
      showDate,
      showTime,
    );
    res.status(status).json({
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getShowDate = async (req: Request, res: Response) => {
  try {
    const movieId = req.query.movieId as string;
    const theatreId = req.query.theatreId as string;
    const screenId = req.query.screenId as string;
    const { status, data } = await scheduleService.getShowDate(
      movieId,
      theatreId,
      screenId,
    );

    res.status(status).json({
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getShowTime = async (req: Request, res: Response) => {
  try {
    const movieId = req.query.movieId as string;
    const theatreId = req.query.theatreId as string;
    const screenId = req.query.screenId as string;
    const showDate = req.query.showDate as string;

    const { status, data } = await scheduleService.getShowTime(
      movieId,
      theatreId,
      screenId,
      showDate,
    );

    res.status(status).json({
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addSchedule = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { status, message, data } = await scheduleService.addSchedule(
      req.body,
      user,
    );
    res.status(status).json({
      status,
      message,
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateSchedule = async (req: Request, res: Response) => {
  const scheduleId = parseInt(req.params.id as string);

  try {
    const user = req.user;
    const { status, message, data } = await scheduleService.updateSchedule(
      scheduleId,
      req.body,
      user,
    );
    res.status(status).json({
      status,
      message,
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteSchedule = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const scheduleId = parseInt(req.params.id as string);
    const { status, message } = await scheduleService.deleteSchedule(
      scheduleId,
      user,
    );
    res.status(status).json({
      status,
      message,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
