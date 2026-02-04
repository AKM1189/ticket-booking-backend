import { MovieService } from "../../services/user.service/movie.service";
import { MovieStatus } from "../../types/MovieType";
import { getQueryParams } from "../../utils/queryParams";
import { Request, Response } from "express";
import {
  formatMovie,
  formatMovieDetail,
  formatMovies,
} from "../../utils/response-formatter/movie.formatter";
import { formatCasts } from "../../utils/response-formatter/cast.formatter";
import { formatUser } from "../../utils/response-formatter/user.formatter";

const movieService = new MovieService();

export const getAllMovies = async (req: Request, res: Response) => {
  try {
    const { lang, exp, genre } = req.query;

    const type = req.query.type as MovieStatus;
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);
    const movieId = parseInt(req.query.movieId as string);
    const theatreId = parseInt(req.query.theatreId as string);
    const date = req.query.date as string;

    const langList = Array.isArray(lang) ? lang : lang ? [lang] : [];
    const expList = Array.isArray(exp) ? exp : exp ? [exp] : [];
    const genreList = Array.isArray(genre) ? genre : genre ? [genre] : [];

    const { data, status, total } = await movieService.getAllMovies(
      type,
      langList as string[],
      expList as string[],
      genreList as string[],
      page,
      limit,
      theatreId,
      date,
      movieId,
    );

    res.status(status).json({
      data: formatMovies(data),
      pagination: {
        total,
        totalPages: Math.max(1, total / limit),
        limit,
        page,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSearchMovies = async (req: Request, res: Response) => {
  try {
    const movieId = parseInt(req.query.movieId as string);
    const theatreId = parseInt(req.query.theatreId as string);
    const showDate = req.query.date as string;

    const { data, status } = await movieService.getSearchMovies(
      theatreId,
      showDate,
      movieId,
    );

    res.status(status).json({
      data: formatMovies(data),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMovieDetail = async (req: Request, res: Response) => {
  try {
    const movieId = parseInt(req.params.id as string);

    const { data, status } = await movieService.getMovieDetail(movieId);
    res.status(status).json({
      data: formatMovieDetail(data),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getShowTimeAndLocation = async (req: Request, res: Response) => {
  try {
    const movieId = parseInt(req.query.movieId as string);
    const showDate = req.query.showDate as string;
    const { data, status } = await movieService.getShowTimeAndLocation(
      movieId,
      showDate,
    );

    res.status(status).json({
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFilterList = async (req: Request, res: Response) => {
  try {
    const { data, status } = await movieService.getFilterList();

    res.status(status).json({
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSearchFilters = async (req: Request, res: Response) => {
  try {
    const { data, status } = await movieService.getSearchFilters();

    res.status(status).json({
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
