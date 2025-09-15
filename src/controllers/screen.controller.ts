import { AppDataSource } from "../data-source";
import { GenreService } from "../services/genre.service";
import { Request, Response } from "express";
import { getQueryParams } from "../utils/queryParams";
import { Genre } from "../entity/Genre";
import { ScreenService } from "../services/screen.service";

const screenService = new ScreenService();

export const getScreen = async (req: Request, res: Response) => {
  try {
    const filter = req.query.status as string;

    const { search, page, limit, sortBy, sortOrder } = getQueryParams(
      req,
      1,
      10,
      "id",
    );
    const { status, data, pagination } = await screenService.getScreen(
      search,
      page,
      limit,
      sortBy,
      sortOrder,
      filter,
    );

    res.status(status).json({
      data,
      pagination,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getScreenByTheatre = async (req: Request, res: Response) => {
  try {
    const theatreId = req.query.theatreId as string;

    const { status, data } = await screenService.getScreenByTheatre(theatreId);

    res.status(status).json({
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getScreenByShow = async (req: Request, res: Response) => {
  try {
    const theatreId = req.query.theatreId as string;
    const movieId = req.query.movieId as string;

    const { status, data } = await screenService.getScreenByShow(
      theatreId,
      movieId,
    );

    res.status(status).json({
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getGenreById = async (req: Request, res: Response) => {
  try {
    const genreRepo = AppDataSource.getRepository(Genre);
    const id = parseInt(req.params.id as string);
    const genre = await genreRepo.findOneBy({ id });
    if (!genre) {
      res.status(404).json({ message: "Genre not found" });
    }
    res.status(200).json({
      data: genre,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addScreen = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { status, message, data } = await screenService.addScreen(
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

export const updateScreen = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const screenId = parseInt(req.params.id as string);
    const { status, message, data } = await screenService.updateScreen(
      screenId,
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

export const deleteScreen = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const screenId = parseInt(req.params.id as string);
    const { status, message } = await screenService.deleteScreen(
      screenId,
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
