import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Movie } from "../entity/Movie";
import { MovieService } from "../services/movie.service";
import { getQueryParams } from "../utils/queryParams";

const movieService = new MovieService();
export const getMovies = async (req: Request, res: Response) => {
  try {
    const movieRepository = AppDataSource.getRepository(Movie);
    const { page, limit, sortBy, sortOrder } = getQueryParams(
      req,
      1,
      10,
      "releaseDate",
    );

    const [movies, total] = await movieRepository.findAndCount({
      order: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    res.status(200).json({
      data: movies,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addMovie = async (req: Request, res: Response) => {
  try {
    const { status, message, data } = await movieService.addMovie(req.body);
    res.status(status).json({
      status,
      message,
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMovieById = async (req: Request, res: Response) => {
  try {
    const movieRepo = AppDataSource.getRepository(Movie);
    const id = parseInt(req.params.id as string);
    const movie = await movieRepo.findOneBy({ id });
    if (!movie) {
      res.status(404).json({ message: "Movie not found" });
    }
    res.status(200).json({
      data: movie,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateMovie = async (req: Request, res: Response) => {
  try {
    const movieId = parseInt(req.params.id as string);
    if (!movieId || isNaN(movieId)) {
      res.status(400).json({ message: "Invalid or missing movie ID" });
    }
    const { status, message, data } = await movieService.updateMovie(
      movieId,
      req.body,
    );
    res.status(201).json({
      status,
      message,
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteMovie = async (req: Request, res: Response) => {
  try {
    const movieId = parseInt(req.params.id as string);
    if (!movieId || isNaN(movieId)) {
      res.status(400).json({ message: "Invalid or missing movie ID" });
    }
    const { status, message } = await movieService.deleteMovie(movieId);
    res.status(status).json({ message });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
