import dayjs from "dayjs";
import { AppDataSource } from "../../data-source";
import { Movie } from "../../entity/Movie";
import { MovieStatus } from "../../types/MovieType";
import { Theatre } from "../../entity/Theatre";
import { ScheduleStatus } from "../../types/ScheduleType";
import { Schedule } from "../../entity/Schedule";
import { setReleaseDate } from "../../utils/formatMovie";
import { Genre } from "../../entity/Genre";

export class MovieService {
  private movieRepo = AppDataSource.getRepository(Movie);
  private theatreRepo = AppDataSource.getRepository(Theatre);
  private scheduleRepo = AppDataSource.getRepository(Schedule);
  private genreRepo = AppDataSource.getRepository(Genre);

  async getAllMovies(
    type: MovieStatus,
    langList: string[],
    expList: string[],
    genreList: string[],
    page: number = 1,
    limit: number = 10,
    theatreId?: number,
    date?: string,
    movieId?: number,
  ) {
    const today = dayjs().format("YYYY-MM-DD");
    const nowTime = dayjs().format("hh:mm");

    let qb = this.movieRepo
      .createQueryBuilder("movie")
      .leftJoinAndSelect("movie.poster", "poster")
      .leftJoinAndSelect("movie.genres", "genres")
      .leftJoinAndSelect("movie.reviews", "reviews")
      .leftJoinAndSelect("movie.schedules", "schedules")
      .leftJoin("schedules.theatre", "theatre");

    if (theatreId) {
      qb.andWhere("theatre.id = :theatreId", { theatreId });
    }

    if (movieId) {
      qb.andWhere("movie.id = :movieId", { movieId });
    }

    if (type === MovieStatus.comingSoon) {
      qb.andWhere("movie.status = :status AND schedules.id IS NULL", {
        status: MovieStatus.comingSoon,
      });
    }

    if (type === MovieStatus.nowShowing) {
      qb.andWhere("schedules.showDate = :today", { today }).andWhere(
        `(schedules.showTime >= :nowTime)`,
        { nowTime },
      );
    }

    if (type === MovieStatus.ticketAvailable) {
      qb.andWhere("schedules.showDate > :today", { today }).andWhere(
        "movie.status != :status",
        { status: MovieStatus.nowShowing },
      );
    }

    if (type === MovieStatus.trending) {
      qb.andWhere("movie.rating >= :rating", { rating: 8.0 });
    }

    if (date) {
      qb.andWhere("schedules.showDate = :date", { date });
    }

    if (langList.length) {
      qb.andWhere(
        "(" +
        langList.map((_, i) => `movie.language LIKE :lang${i}`).join(" OR ") +
        ")",
        Object.fromEntries(langList.map((val, i) => [`lang${i}`, `%${val}%`])),
      );
    }

    if (expList.length) {
      qb.andWhere(
        "(" +
        expList.map((_, i) => `movie.experience LIKE :exp${i}`).join(" OR ") +
        ")",
        Object.fromEntries(expList.map((val, i) => [`exp${i}`, `%${val}%`])),
      );
    }

    if (genreList.length) {
      qb.andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select("mg.movieId")
          .from("movie_genres_genre", "mg") // join table
          .leftJoin("genre", "g", "mg.genreId = g.id") // join Genre table
          .where("mg.movieId = movie.id")
          .andWhere("g.name IN (:...genreList)", { genreList })
          .getQuery();
        return `EXISTS ${subQuery}`;
      });
    }

    qb.orderBy("movie.releaseDate", "DESC");

    qb.skip((page - 1) * limit) // offset
      .take(limit);

    const [movies, total] = await qb.getManyAndCount();

    if (movies.length > 0) {
      movies.map((movie) => setReleaseDate(movie));
    }

    return {
      status: 200,
      data: movies,
      total,
    };
  }

  async getMovieDetail(movieId: number) {
    const today = dayjs().format("YYYY-MM-DD");
    let qb = this.movieRepo
      .createQueryBuilder("movie")
      .leftJoinAndSelect("movie.genres", "genres")
      .leftJoinAndSelect("movie.casts", "casts")
      .leftJoinAndSelect("casts.image", "image")
      .leftJoinAndSelect("movie.poster", "poster")
      .leftJoinAndSelect("movie.photos", "photos")
      .leftJoinAndSelect("movie.reviews", "reviews")
      .leftJoinAndSelect("reviews.user", "user")
      .leftJoinAndSelect("user.image", "profile")
      .leftJoinAndSelect("movie.schedules", "schedules")
      .leftJoinAndSelect("schedules.theatre", "theatre")
      .where("movie.id = :movieId", { movieId });

    qb.orderBy(`movie.releaseDate`, "DESC");

    const movie = await qb.getOne();

    const formattedMovie = movie ? setReleaseDate(movie) : null;

    return {
      status: 200,
      data: formattedMovie,
    };
  }

  async getShowTimeAndLocation(movieId: number, showDate: string) {
    const schedules = await this.scheduleRepo
      .createQueryBuilder("schedule")
      .leftJoin("schedule.movie", "movie")
      .leftJoin("schedule.theatre", "theatre")
      .leftJoin("schedule.screen", "screen")
      .where("schedule.showDate = :showDate", { showDate: showDate || dayjs().format('YYYY-MM-DD') })
      .andWhere("schedule.status = :status", { status: ScheduleStatus.active })
      .andWhere("movie.id = :movieId", { movieId })
      .select([
        "schedule.id",
        "schedule.showTime",
        "schedule.showDate",
        "schedule.language",
        "schedule.subtitle",
        "movie.id",
        "movie.title",
        "movie.duration",
        "theatre.id",
        "theatre.location",
        "screen.id",
        "screen.name",
      ])
      .getMany();

    return {
      status: 200,
      data: schedules,
    };
  }

  async getSearchMovies(theatreId: number, date: string, movieId: number) {
    let qb = this.movieRepo
      .createQueryBuilder("movie")
      .leftJoinAndSelect("movie.schedules", "schedules")
      .leftJoin("schedules.theatre", "theatre")
      .andWhere("movie.id = :movieId", { movieId })
      .andWhere("theatre.id = :theatreId", { theatreId })
      .andWhere("schedules.showDate = :date", { date })
      .distinct(true);

    qb.orderBy("movie.releaseDate", "DESC");

    const [movies, total] = await qb.getManyAndCount();

    if (movies.length > 0) {
      movies.map((movie) => setReleaseDate(movie));
    }

    return {
      status: 200,
      data: movies,
      total,
    };
  }

  async getFilterList() {
    const languages = await this.movieRepo.find({
      select: { language: true },
    });

    // Flatten arrays and remove duplicates
    const formattedLanguages = [
      ...new Set(languages.flatMap((r) => r.language)),
    ];

    const exps = await this.movieRepo.find({
      select: { experience: true },
    });

    // Flatten arrays and remove duplicates
    const formattedExps = [...new Set(exps.flatMap((r) => r.experience))];

    const genres = await this.genreRepo.find();

    return {
      status: 200,
      data: {
        languages: formattedLanguages,
        experiences: formattedExps,
        genres,
      },
    };
  }

  async getSearchFilters() {
    const today = dayjs().format("YYYY-MM-DD");
    const maxDay = dayjs().add(4, "day").format("YYYY-MM-DD");
    const nowTime = dayjs().format("HH:mm");

    // theatres

    const theatreQuery = this.theatreRepo
      .createQueryBuilder("theatre")
      .innerJoin("theatre.schedules", "schedules")
      .innerJoin("schedules.movie", "movie")
      .where(
        `(schedules.showDate >= :today AND schedules.showDate <= :maxDay)`,
        { today, maxDay },
      )
      .andWhere("schedules.status = :status", {
        status: ScheduleStatus.active,
      })
      .andWhere("theatre.active = 1")
      .andWhere(
        "(schedules.showDate != :today OR schedules.showTime >= :nowTime)",
        { today, nowTime },
      )
      .distinct(true);

    const theatres = await theatreQuery.getMany();

    // movie
    let movieQuery = this.movieRepo
      .createQueryBuilder("movie")
      .leftJoin("movie.schedules", "schedules")
      .leftJoin("schedules.theatre", "theatre")
      .andWhere(
        `(schedules.showDate >= :today AND schedules.showDate <= :maxDay)`,
        { today, maxDay },
      )
      .andWhere(
        "(schedules.showDate != :today OR schedules.showTime >= :nowTime)",
        { today, nowTime },
      )
      .distinct(true);

    movieQuery.orderBy("movie.releaseDate", "DESC");

    const movies = await movieQuery.getMany();

    const scheduleQuery = this.scheduleRepo
      .createQueryBuilder("schedule")
      .select("schedule.showDate", "showDate")
      .leftJoin("schedule.theatre", "theatre")
      .leftJoin("schedule.movie", "movie")
      .where("movie.status = :status", {
        status: MovieStatus.nowShowing,
      })
      .andWhere(
        `(schedule.showDate >= :today AND schedule.showDate <= :maxDay)`,
        { today, maxDay },
      )
      .andWhere(
        "(schedule.showDate != :today OR schedule.showTime >= :nowTime)",
        { today, nowTime },
      )
      .distinct(true);

    const showDates = await scheduleQuery.getRawMany();
    const formattedShowDates = showDates?.map((date) =>
      dayjs(date?.showDate).format("YYYY-MM-DD"),
    );
    return {
      status: 200,
      data: {
        movies,
        theatres,
        showDates: formattedShowDates,
      },
    };
  }
}
