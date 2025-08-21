import { AppDataSource } from "../data-source";
import { Request, Response } from "express";
import { getQueryParams } from "../utils/queryParams";
import { TheatreService } from "../services/theatre.service";
import { Theatre } from "../entity/Theatre";

const theatreService = new TheatreService();

export const getTheatre = async (req: Request, res: Response) => {
  try {
    const filter = req.query.status as string;
    const { search, page, limit, sortBy, sortOrder } = getQueryParams(
      req,
      1,
      10,
      "id",
    );
    const { status, data, pagination } = await theatreService.getTheatres(
      filter,
      search,
      page,
      limit,
      sortBy,
      sortOrder,
    );

    res.status(status).json({
      data,
      pagination,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTheatreById = async (req: Request, res: Response) => {
  try {
    const theatreRepo = AppDataSource.getRepository(Theatre);
    const id = parseInt(req.params.id as string);
    const theatre = await theatreRepo.findOneBy({ id });
    if (!theatre) {
      res.status(404).json({ message: "Theatre not found" });
    }
    res.status(200).json({
      data: theatre,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addTheatre = async (req: Request, res: Response) => {
  try {
    const { status, message, data } = await theatreService.addTheatre(req.body);
    res.status(status).json({
      status,
      message,
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTheatre = async (req: Request, res: Response) => {
  try {
    const theatreId = parseInt(req.params.id as string);
    const { status, message, data } = await theatreService.updateTheatre(
      theatreId,
      req.body,
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

export const deleteTheatre = async (req: Request, res: Response) => {
  try {
    const theatreId = parseInt(req.params.id as string);
    const { status, message } = await theatreService.deleteTheatre(theatreId);
    res.status(status).json({
      status,
      message,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
