"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieService = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const data_source_1 = require("../../data-source");
const Movie_1 = require("../../entity/Movie");
const MovieType_1 = require("../../types/MovieType");
const Theatre_1 = require("../../entity/Theatre");
const ScheduleType_1 = require("../../types/ScheduleType");
const Schedule_1 = require("../../entity/Schedule");
const formatMovie_1 = require("../../utils/formatMovie");
const Genre_1 = require("../../entity/Genre");
const movie_formatter_1 = require("../../utils/response-formatter/movie.formatter");
class MovieService {
    movieRepo = data_source_1.AppDataSource.getRepository(Movie_1.Movie);
    theatreRepo = data_source_1.AppDataSource.getRepository(Theatre_1.Theatre);
    scheduleRepo = data_source_1.AppDataSource.getRepository(Schedule_1.Schedule);
    genreRepo = data_source_1.AppDataSource.getRepository(Genre_1.Genre);
    async getAllMovies(type, langList, expList, genreList, page = 1, limit = 10, theatreId, date, movieId) {
        const today = (0, dayjs_1.default)().format("YYYY-MM-DD");
        const nowTime = (0, dayjs_1.default)().add(15, "minute").format("HH:mm");
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
        if (type === MovieType_1.MovieStatus.comingSoon) {
            qb.andWhere("movie.status = :status AND schedules.id IS NULL", {
                status: MovieType_1.MovieStatus.comingSoon,
            });
        }
        if (type === MovieType_1.MovieStatus.nowShowing) {
            if (type === MovieType_1.MovieStatus.nowShowing) {
                qb.andWhere("schedules.showDate = :today", { today }).andWhere("schedules.showTime >= :nowTime", { nowTime });
            }
        }
        if (type === MovieType_1.MovieStatus.ticketAvailable) {
            qb.andWhere("schedules.showDate > :today", { today }).andWhere("movie.status != :status", { status: MovieType_1.MovieStatus.nowShowing });
        }
        if (type === MovieType_1.MovieStatus.trending) {
            qb.andWhere("movie.rating >= :rating", { rating: 8.0 });
        }
        if (date) {
            qb.andWhere("schedules.showDate = :date", { date });
        }
        if (langList.length) {
            qb.andWhere("(" +
                langList.map((_, i) => `movie.language LIKE :lang${i}`).join(" OR ") +
                ")", Object.fromEntries(langList.map((val, i) => [`lang${i}`, `%${val}%`])));
        }
        if (expList.length) {
            qb.andWhere("(" +
                expList.map((_, i) => `movie.experience LIKE :exp${i}`).join(" OR ") +
                ")", Object.fromEntries(expList.map((val, i) => [`exp${i}`, `%${val}%`])));
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
            movies.map((movie) => (0, formatMovie_1.setReleaseDate)(movie));
        }
        return {
            status: 200,
            data: movies,
            total,
        };
    }
    async getMovieDetail(movieId) {
        const today = (0, dayjs_1.default)().format("YYYY-MM-DD");
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
        const formattedMovie = movie ? (0, formatMovie_1.setReleaseDate)(movie) : null;
        return {
            status: 200,
            data: formattedMovie,
        };
    }
    async getShowTimeAndLocation(movieId, showDate) {
        const schedules = await this.scheduleRepo
            .createQueryBuilder("schedule")
            .leftJoin("schedule.movie", "movie")
            .leftJoin("schedule.theatre", "theatre")
            .leftJoin("schedule.screen", "screen")
            .where("schedule.showDate = :showDate", {
            showDate: showDate || (0, dayjs_1.default)().format("YYYY-MM-DD"),
        })
            .andWhere("schedule.status = :status", { status: ScheduleType_1.ScheduleStatus.active })
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
    async getSearchMovies(theatreId, date, movieId) {
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
            movies.map((movie) => (0, formatMovie_1.setReleaseDate)(movie));
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
        const today = (0, dayjs_1.default)().format("YYYY-MM-DD");
        const maxDay = (0, dayjs_1.default)().add(4, "day").format("YYYY-MM-DD");
        const nowTime = (0, dayjs_1.default)().format("HH:mm");
        // theatres
        const theatreQuery = this.theatreRepo
            .createQueryBuilder("theatre")
            .innerJoin("theatre.schedules", "schedules")
            .innerJoin("schedules.movie", "movie")
            .andWhere("schedules.status = :status", {
            status: ScheduleType_1.ScheduleStatus.active,
        })
            .where("movie.status IN (:...statuses)", {
            statuses: [MovieType_1.MovieStatus.nowShowing, MovieType_1.MovieStatus.ticketAvailable],
        })
            .andWhere("theatre.active = 1")
            .andWhere("(schedules.showDate != :today OR schedules.showTime >= :nowTime)", { today, nowTime })
            .distinct(true);
        const theatres = await theatreQuery.getMany();
        // movie
        let movieQuery = this.movieRepo
            .createQueryBuilder("movie")
            .leftJoin("movie.schedules", "schedules")
            .leftJoin("schedules.theatre", "theatre")
            // .andWhere(
            //   `(schedules.showDate >= :today AND schedules.showDate <= :maxDay)`,
            //   { today, maxDay },
            // )
            .where("movie.status IN (:...statuses)", {
            statuses: [MovieType_1.MovieStatus.nowShowing, MovieType_1.MovieStatus.ticketAvailable],
        })
            .andWhere("(schedules.showDate != :today OR schedules.showTime >= :nowTime)", { today, nowTime })
            .distinct(true);
        movieQuery.orderBy("movie.releaseDate", "DESC");
        const movies = await movieQuery.getMany();
        const scheduleQuery = this.scheduleRepo
            .createQueryBuilder("schedule")
            .select("schedule.showDate", "showDate")
            .leftJoin("schedule.theatre", "theatre")
            .leftJoin("schedule.movie", "movie")
            .where("movie.status = :status", {
            status: MovieType_1.MovieStatus.nowShowing,
        })
            .andWhere(`(schedule.showDate >= :today AND schedule.showDate <= :maxDay)`, { today, maxDay })
            .andWhere("(schedule.showDate != :today OR schedule.showTime >= :nowTime)", { today, nowTime })
            .distinct(true);
        const showDates = await scheduleQuery.getRawMany();
        const formattedShowDates = showDates?.map((date) => (0, dayjs_1.default)(date?.showDate).format("YYYY-MM-DD"));
        return {
            status: 200,
            data: {
                movies: (0, movie_formatter_1.formatMovies)(movies),
                theatres,
                showDates: formattedShowDates,
            },
        };
    }
}
exports.MovieService = MovieService;
//# sourceMappingURL=movie.service.js.map