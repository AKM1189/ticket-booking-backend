import { Request, Response } from "express";
import { ReportService } from "../services/report.service";

const reportService = new ReportService();

export const getCardInfo = async (req: Request, res: Response) => {
  try {
    const { status, data } = await reportService.getCardInfo();

    res.status(status).json({
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRecentRecords = async (req: Request, res: Response) => {
  try {
    const { status, data } = await reportService.recentRecords();
    res.status(status).json({
      data,
    });
  } catch (err) {
    res.status(500).json({ messsage: err.message });
  }
};
