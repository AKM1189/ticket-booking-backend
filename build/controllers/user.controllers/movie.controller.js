"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSearchFilters = exports.getFilterList = exports.getShowTimeAndLocation = exports.getMovieDetail = exports.getSearchMovies = exports.getAllMovies = void 0;
const movie_service_1 = require("../../services/user.service/movie.service");
const movie_formatter_1 = require("../../utils/response-formatter/movie.formatter");
const movieService = new movie_service_1.MovieService();
const getAllMovies = async (req, res) => {
    try {
        const { lang, exp, genre } = req.query;
        const type = req.query.type;
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const movieId = parseInt(req.query.movieId);
        const theatreId = parseInt(req.query.theatreId);
        const date = req.query.date;
        const langList = Array.isArray(lang) ? lang : lang ? [lang] : [];
        const expList = Array.isArray(exp) ? exp : exp ? [exp] : [];
        const genreList = Array.isArray(genre) ? genre : genre ? [genre] : [];
        const { data, status, total } = await movieService.getAllMovies(type, langList, expList, genreList, page, limit, theatreId, date, movieId);
        res.status(status).json({
            data: (0, movie_formatter_1.formatMovies)(data),
            pagination: {
                total,
                totalPages: Math.max(1, total / limit),
                limit,
                page,
            },
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getAllMovies = getAllMovies;
const getSearchMovies = async (req, res) => {
    try {
        const movieId = parseInt(req.query.movieId);
        const theatreId = parseInt(req.query.theatreId);
        const showDate = req.query.date;
        const { data, status } = await movieService.getSearchMovies(theatreId, showDate, movieId);
        res.status(status).json({
            data: (0, movie_formatter_1.formatMovies)(data),
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getSearchMovies = getSearchMovies;
const getMovieDetail = async (req, res) => {
    try {
        const movieId = parseInt(req.params.id);
        const { data, status } = await movieService.getMovieDetail(movieId);
        res.status(status).json({
            data: (0, movie_formatter_1.formatMovieDetail)(data),
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getMovieDetail = getMovieDetail;
const getShowTimeAndLocation = async (req, res) => {
    try {
        const movieId = parseInt(req.query.movieId);
        const showDate = req.query.showDate;
        const { data, status } = await movieService.getShowTimeAndLocation(movieId, showDate);
        res.status(status).json({
            data,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getShowTimeAndLocation = getShowTimeAndLocation;
const getFilterList = async (req, res) => {
    try {
        const { data, status } = await movieService.getFilterList();
        res.status(status).json({
            data,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getFilterList = getFilterList;
const getSearchFilters = async (req, res) => {
    try {
        const { data, status } = await movieService.getSearchFilters();
        res.status(status).json({
            data,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getSearchFilters = getSearchFilters;
//# sourceMappingURL=movie.controller.js.map