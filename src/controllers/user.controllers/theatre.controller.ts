import { TheatreService } from "../../services/user.service/theatre.service";
import { Request, Response } from "express";

const theatreService = new TheatreService();

export const getShowingTheatres = async (req: Request, res: Response) => {
  try {
    const { data, status } = await theatreService.getShowingTheatres();

    res.status(status).json({
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
