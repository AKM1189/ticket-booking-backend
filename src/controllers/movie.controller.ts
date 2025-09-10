import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Movie } from "../entity/Movie";
import { MovieService } from "../services/movie.service";
import { getQueryParams } from "../utils/queryParams";
import { Like } from "typeorm";
import { MulterFileWithLocation } from "../types/multer-s3-type";
import dayjs from "dayjs";
import { MovieStatus } from "../types/MovieType";

const movieService = new MovieService();
export const getMovies = async (req: Request, res: Response) => {
  try {
    const movieRepository = AppDataSource.getRepository(Movie);
    const { page, limit, sortBy, sortOrder, status, search } = getQueryParams(
      req,
      1,
      10,
      "releaseDate",
      null,
      null,
    );

    // Build where clause conditionally
    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }
    if (search) {
      whereClause.title = Like(`%${search}%`);
    }

    const [movies, total] = await movieRepository.findAndCount({
      relations: [
        "genres",
        "casts",
        "poster",
        "photos",
        "reviews",
        "schedules",
      ],
      order: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
      where: whereClause,
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

export const getAllMovies = async (req: Request, res: Response) => {
  try {
    const movieRepository = AppDataSource.getRepository(Movie);

    const movies = await movieRepository.find();

    res.status(200).json({
      data: movies,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getShowingMovies = async (req: Request, res: Response) => {
  try {
    const today = dayjs().format("YYYY-MM-DD");
    const time = dayjs().format("HH:mm:ss");

    const movies = await AppDataSource.getRepository(Movie)
      .createQueryBuilder("movie")
      .innerJoin("movie.schedules", "schedule")
      .leftJoinAndSelect("movie.genres", "genres")
      .leftJoinAndSelect("movie.casts", "casts")
      .leftJoinAndSelect("movie.poster", "poster") // include poster
      .leftJoinAndSelect("movie.photos", "photos")
      .leftJoinAndSelect("movie.reviews", "reviews")
      .where(
        `(schedule.showDate = :today AND schedule.showTime >= :time) OR (schedule.showDate > :today)`,
        { today, time },
      )
      .andWhere("movie.status IN (:...statuses)", {
        statuses: [MovieStatus.nowShowing, MovieStatus.ticketAvailable],
      })
      .distinct(true)
      .getMany();

    res.status(200).json({
      data: movies,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addMovie = async (req: Request, res: Response) => {
  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };
  const poster = files["poster"]?.[0];
  const photos = files["photos[]"] || [];

  const posterUrl = `${req.protocol}://${req.get("host")}/uploads/${
    poster.filename
  }`;
  const photoUrls = photos.map((file) => {
    return `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
  });

  try {
    const { status, message, data } = await movieService.addMovie(
      req.body,
      posterUrl,
      photoUrls,
    );

    res.status(status).json({
      status,
      message,
      data,
    });
  } catch (err) {
    res.status(500).json({ err, message: err.message });
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

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };
    const poster = files["poster"]?.[0] || null;
    const photos = files["photos[]"] || [];
    const posterUrl = `${req.protocol}://${req.get("host")}/uploads/${
      poster.filename
    }`;
    const photoUrls = photos.map((file) => {
      return `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
    });

    const { status, message } = await movieService.updateMovie(
      movieId,
      req.body,
      posterUrl,
      photoUrls,
    );
    res.status(201).json({
      status,
      message,
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
