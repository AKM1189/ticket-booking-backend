import { Request, Response } from "express";
import { ReportService } from "../../services/admin.service/report.service";

const reportService = new ReportService();

export const getCardInfo = async (req: Request, res: Response) => {
  try {
    const { status, data } = await reportService.getCardInfo(req.user);

    res.status(status).json({
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRecentRecords = async (req: Request, res: Response) => {
  try {
    const { status, data } = await reportService.recentRecords(req.user);
    res.status(status).json({
      data,
    });
  } catch (err) {
    res.status(500).json({ messsage: err.message });
  }
};
