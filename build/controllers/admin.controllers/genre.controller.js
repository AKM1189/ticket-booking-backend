"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGenre = exports.updateGenre = exports.addGenre = exports.getGenreById = exports.getAllGenre = exports.getGenre = void 0;
const data_source_1 = require("../../data-source");
const genre_service_1 = require("../../services/admin.service/genre.service");
const queryParams_1 = require("../../utils/queryParams");
const Genre_1 = require("../../entity/Genre");
const genreService = new genre_service_1.GenreService();
const getGenre = async (req, res) => {
    try {
        const { page, limit, sortBy, sortOrder, search } = (0, queryParams_1.getQueryParams)(req, 1, 10, "id");
        const { status, data, pagination } = await genreService.getGenre(page, limit, sortBy, sortOrder, search);
        res.status(status).json({
            data,
            pagination,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getGenre = getGenre;
const getAllGenre = async (req, res) => {
    try {
        const { status, data } = await genreService.getAllGenre();
        res.status(status).json({
            data,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getAllGenre = getAllGenre;
const getGenreById = async (req, res) => {
    try {
        const genreRepo = data_source_1.AppDataSource.getRepository(Genre_1.Genre);
        const id = parseInt(req.params.id);
        const genre = await genreRepo.findOneBy({ id });
        if (!genre) {
            res.status(404).json({ message: "Genre not found" });
        }
        res.status(200).json({
            data: genre,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getGenreById = getGenreById;
const addGenre = async (req, res) => {
    try {
        const { status, message, data } = await genreService.addGenre(req.body);
        res.status(status).json({
            status,
            message,
            data,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.addGenre = addGenre;
const updateGenre = async (req, res) => {
    try {
        const genreId = parseInt(req.params.id);
        const { status, message, data } = await genreService.updateGenre(genreId, req.body);
        res.status(status).json({
            status,
            message,
            data,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.updateGenre = updateGenre;
const deleteGenre = async (req, res) => {
    try {
        const genreId = parseInt(req.params.id);
        const { status, message } = await genreService.deleteGenre(genreId);
        res.status(status).json({
            status,
            message,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.deleteGenre = deleteGenre;
//# sourceMappingURL=genre.controller.js.map