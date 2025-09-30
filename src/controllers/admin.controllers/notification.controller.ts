import { Request, Response } from "express";
import { getQueryParams } from "../../utils/queryParams";
import { NotificationService } from "../../services/admin.service/notification.service";

const notiService = new NotificationService();

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const type = req.params.type as string;
    const { page, limit } = getQueryParams(req, 1, 10, "id");
    const { status, data, pagination } = await notiService.getNotifications(
      page,
      limit,
      "createdAt",
      "DESC",
      userId,
      type,
    );

    res.status(status).json({
      data,
      pagination,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const readNoti = async (req: Request, res: Response) => {
  try {
    const notiId = req.params.id as string;
    const userId = req.user.id;
    const { status, message } = await notiService.readNoti(notiId, userId);
    res.status(status).json({
      status,
      message,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const readAllNoti = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { status, message } = await notiService.readAllNoti(userId);
    res.status(status).json({
      status,
      message,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
