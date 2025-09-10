import { AppDataSource } from "../data-source";
import { GenreService } from "../services/genre.service";
import { Request, Response } from "express";
import { getQueryParams } from "../utils/queryParams";
import { Genre } from "../entity/Genre";

const genreService = new GenreService();

export const getGenre = async (req: Request, res: Response) => {
  try {
    const { page, limit, sortBy, sortOrder, search } = getQueryParams(
      req,
      1,
      10,
      "id",
    );
    const { status, data, pagination } = await genreService.getGenre(
      page,
      limit,
      sortBy,
      sortOrder,
      search,
    );

    res.status(status).json({
      data,
      pagination,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllGenre = async (req: Request, res: Response) => {
  try {
    const { status, data } = await genreService.getAllGenre();

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

export const addGenre = async (req: Request, res: Response) => {
  try {
    const { status, message, data } = await genreService.addGenre(req.body);
    res.status(status).json({
      status,
      message,
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateGenre = async (req: Request, res: Response) => {
  try {
    const genreId = parseInt(req.params.id as string);
    const { status, message, data } = await genreService.updateGenre(
      genreId,
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

export const deleteGenre = async (req: Request, res: Response) => {
  try {
    const genreId = parseInt(req.params.id as string);
    const { status, message } = await genreService.deleteGenre(genreId);
    res.status(status).json({
      status,
      message,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
