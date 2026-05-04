"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMovie = exports.updateMovie = exports.getMovieById = exports.addMovie = exports.getShowingMovies = exports.getAllMovies = exports.getMovies = void 0;
const data_source_1 = require("../../data-source");
const Movie_1 = require("../../entity/Movie");
const movie_service_1 = require("../../services/admin.service/movie.service");
const queryParams_1 = require("../../utils/queryParams");
const typeorm_1 = require("typeorm");
const movie_formatter_1 = require("../../utils/response-formatter/movie.formatter");
const movieService = new movie_service_1.MovieService();
const getMovies = async (req, res) => {
    try {
        const movieRepository = data_source_1.AppDataSource.getRepository(Movie_1.Movie);
        const { page, limit, sortBy, sortOrder, status, search } = (0, queryParams_1.getQueryParams)(req, 1, 10, "releaseDate", null, null);
        // Build where clause conditionally
        const whereClause = {};
        if (status) {
            whereClause.status = status;
        }
        if (search) {
            whereClause.title = (0, typeorm_1.Like)(`%${search}%`);
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
            data: (0, movie_formatter_1.formatMovies)(movies),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getMovies = getMovies;
const getAllMovies = async (req, res) => {
    try {
        const movieRepository = data_source_1.AppDataSource.getRepository(Movie_1.Movie);
        const movies = await movieRepository.find();
        res.status(200).json({
            data: (0, movie_formatter_1.formatMovies)(movies),
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getAllMovies = getAllMovies;
const getShowingMovies = async (req, res) => {
    try {
        const user = req.user;
        const movies = await movieService.getShowingMovies(user);
        res.status(200).json({
            data: (0, movie_formatter_1.formatMovies)(movies),
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getShowingMovies = getShowingMovies;
const addMovie = async (req, res) => {
    const files = req.files;
    const user = req.user;
    try {
        const { status, message, data } = await movieService.addMovie(req.body, files, user);
        res.status(status).json({
            status,
            message,
            data,
        });
    }
    catch (err) {
        res.status(500).json({ err, message: err.message });
    }
};
exports.addMovie = addMovie;
const getMovieById = async (req, res) => {
    try {
        const movieRepo = data_source_1.AppDataSource.getRepository(Movie_1.Movie);
        const id = parseInt(req.params.id);
        const movie = await movieRepo.findOneBy({ id });
        if (!movie) {
            res.status(404).json({ message: "Movie not found" });
        }
        res.status(200).json({
            data: (0, movie_formatter_1.formatMovie)(movie),
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getMovieById = getMovieById;
const updateMovie = async (req, res) => {
    try {
        const user = req.user;
        const movieId = parseInt(req.params.id);
        if (!movieId || isNaN(movieId)) {
            res.status(400).json({ message: "Invalid or missing movie ID" });
        }
        const files = req.files;
        const { status, message } = await movieService.updateMovie(movieId, req.body, files, user);
        res.status(201).json({
            status,
            message,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.updateMovie = updateMovie;
const deleteMovie = async (req, res) => {
    try {
        const user = req.user;
        const movieId = parseInt(req.params.id);
        if (!movieId || isNaN(movieId)) {
            res.status(400).json({ message: "Invalid or missing movie ID" });
        }
        const { status, message } = await movieService.deleteMovie(movieId, user);
        res.status(status).json({ message });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.deleteMovie = deleteMovie;
//# sourceMappingURL=movie.controller.js.map