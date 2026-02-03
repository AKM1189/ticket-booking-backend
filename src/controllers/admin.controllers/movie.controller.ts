import { Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { Movie } from "../../entity/Movie";
import { MovieService } from "../../services/admin.service/movie.service";
import { getQueryParams } from "../../utils/queryParams";
import { Like } from "typeorm";
import dayjs from "dayjs";
import { MovieStatus } from "../../types/MovieType";
import { Role } from "../../types/AuthType";
import dotenv from "dotenv";
import { extractFileKeys } from "../../utils/extractImage";
import { uploadToR2 } from "../../config/r2-upload";
dotenv.config();

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
    const user = req.user;
    const today = dayjs().format("YYYY-MM-DD");
    const time = dayjs().format("HH:mm:ss");

    const movieQuery = AppDataSource.getRepository(Movie)
      .createQueryBuilder("movie")
      .innerJoin(
        "movie.schedules",
        "schedule",
        "schedule.showDate = :today AND schedule.showTime >= :time OR schedule.showDate > :today",
        { today, time },
      )
      .leftJoinAndSelect("movie.genres", "genres")
      .leftJoinAndSelect("movie.casts", "casts")
      .leftJoinAndSelect("movie.poster", "poster")
      .leftJoinAndSelect("movie.photos", "photos")
      .leftJoinAndSelect("movie.reviews", "reviews")
      .where("movie.status IN (:...statuses)", {
        statuses: [MovieStatus.nowShowing, MovieStatus.ticketAvailable],
      });

    if (user?.role === Role.staff) {
      movieQuery.innerJoin(
        "schedule.theatre",
        "theatre",
        "theatre.id = :theatreId",
        { theatreId: user.theatre.id },
      );
    }

    const movies = await movieQuery.getMany();

    res.status(200).json({
      data: movies,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addMovie = async (req: Request, res: Response) => {
  //  const files = req.files as {
  //     poster?: Express.Multer.File[];
  //     "photos[]": Express.Multer.File[];
  //   };

  //   const posterKey = `movies/${Date.now()}-${files.poster[0].originalname}`;
  //   await uploadToR2(files.poster[0], posterKey);
  //  const photoKeys = await Promise.all(
  //       files["photos[]"].map((file) => {
  //         const key = `movies/${Date.now()}-${file.originalname}`;
  //         return uploadToR2(file, key);
  //       })
  //     );
  //   const posterUrl = files.poster?.[0]?.key ?? null;

  //   const photoUrls = files["photos[]"]
  //     ? files["photos[]"].map((f) => f.key!)
  //     : [];

  // const {singleUrl, multipleUrls} = extractFileKeys(req.files as any, {
  //   single: "poster",
  //   multiple: "photos[]"
  // })

  const user = req.user;

  try {
    const { status, message, data } = await movieService.addMovie(
      req.body,
      req.files,
      user,
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
    const user = req.user;
    const movieId = parseInt(req.params.id as string);
    if (!movieId || isNaN(movieId)) {
      res.status(400).json({ message: "Invalid or missing movie ID" });
    }

    const { singleUrl, multipleUrls } = extractFileKeys(req.files as any, {
      single: "poster",
      multiple: "photos[]",
    });

    const { status, message } = await movieService.updateMovie(
      movieId,
      req.body,
      singleUrl,
      multipleUrls,
      user,
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
    const user = req.user;
    const movieId = parseInt(req.params.id as string);
    if (!movieId || isNaN(movieId)) {
      res.status(400).json({ message: "Invalid or missing movie ID" });
    }
    const { status, message } = await movieService.deleteMovie(movieId, user);
    res.status(status).json({ message });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
