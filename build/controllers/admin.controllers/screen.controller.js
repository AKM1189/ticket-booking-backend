"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteScreen = exports.updateScreen = exports.addScreen = exports.getGenreById = exports.getScreenByShow = exports.getScreenByTheatre = exports.getScreen = void 0;
const data_source_1 = require("../../data-source");
const queryParams_1 = require("../../utils/queryParams");
const Genre_1 = require("../../entity/Genre");
const screen_service_1 = require("../../services/admin.service/screen.service");
const screenService = new screen_service_1.ScreenService();
const getScreen = async (req, res) => {
    try {
        const filter = req.query.status;
        const { search, page, limit, sortBy, sortOrder } = (0, queryParams_1.getQueryParams)(req, 1, 10, "id");
        const { status, data, pagination } = await screenService.getScreen(search, page, limit, sortBy, sortOrder, filter);
        res.status(status).json({
            data,
            pagination,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getScreen = getScreen;
const getScreenByTheatre = async (req, res) => {
    try {
        const theatreId = req.query.theatreId;
        const { status, data } = await screenService.getScreenByTheatre(theatreId);
        res.status(status).json({
            data,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getScreenByTheatre = getScreenByTheatre;
const getScreenByShow = async (req, res) => {
    try {
        const theatreId = req.query.theatreId;
        const movieId = req.query.movieId;
        const { status, data } = await screenService.getScreenByShow(theatreId, movieId);
        res.status(status).json({
            data,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getScreenByShow = getScreenByShow;
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
const addScreen = async (req, res) => {
    try {
        const user = req.user;
        const { status, message, data } = await screenService.addScreen(req.body, user);
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
exports.addScreen = addScreen;
const updateScreen = async (req, res) => {
    try {
        const user = req.user;
        const screenId = parseInt(req.params.id);
        const { status, message, data } = await screenService.updateScreen(screenId, req.body, user);
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
exports.updateScreen = updateScreen;
const deleteScreen = async (req, res) => {
    try {
        const user = req.user;
        const screenId = parseInt(req.params.id);
        const { status, message } = await screenService.deleteScreen(screenId, user);
        res.status(status).json({
            status,
            message,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.deleteScreen = deleteScreen;
//# sourceMappingURL=screen.controller.js.map