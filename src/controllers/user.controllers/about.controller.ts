import { AboutService } from "../../services/user.service/about.service";
import { Request, Response } from "express";

const aboutService = new AboutService();

export const getAboutInfo = async (req: Request, res: Response) => {
  try {
    const { data, status } = await aboutService.getAboutInfo();

    res.status(status).json({
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
