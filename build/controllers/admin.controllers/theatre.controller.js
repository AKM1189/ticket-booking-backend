"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTheatre = exports.updateTheatre = exports.addTheatre = exports.getTheatreById = exports.getTheatreByShowingMovie = exports.getAllTheatres = exports.getTheatre = void 0;
const data_source_1 = require("../../data-source");
const queryParams_1 = require("../../utils/queryParams");
const theatre_service_1 = require("../../services/admin.service/theatre.service");
const Theatre_1 = require("../../entity/Theatre");
const theatreService = new theatre_service_1.TheatreService();
const getTheatre = async (req, res) => {
    try {
        const filter = req.query.status;
        const { search, page, limit, sortBy, sortOrder } = (0, queryParams_1.getQueryParams)(req, 1, 10, "id");
        const { status, data, pagination } = await theatreService.getTheatres(filter, search, page, limit, sortBy, sortOrder);
        res.status(status).json({
            data,
            pagination,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getTheatre = getTheatre;
const getAllTheatres = async (req, res) => {
    try {
        const theatreRepo = data_source_1.AppDataSource.getRepository(Theatre_1.Theatre);
        const theatres = await theatreRepo
            .createQueryBuilder("theatre")
            .leftJoinAndSelect("theatre.screens", "screen")
            .leftJoinAndSelect("theatre.schedules", "schedule")
            .where("screen.id IS NOT NULL") // ensures at least one screen
            .getMany();
        res.status(200).json({
            data: theatres,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getAllTheatres = getAllTheatres;
const getTheatreByShowingMovie = async (req, res) => {
    try {
        const movieId = req.query.movieId;
        const { status, data } = await theatreService.getTheatresByShowingMovie(movieId);
        res.status(status).json({
            data,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getTheatreByShowingMovie = getTheatreByShowingMovie;
const getTheatreById = async (req, res) => {
    try {
        const theatreRepo = data_source_1.AppDataSource.getRepository(Theatre_1.Theatre);
        const id = parseInt(req.params.id);
        const theatre = await theatreRepo.findOneBy({ id });
        if (!theatre) {
            res.status(404).json({ message: "Theatre not found" });
        }
        res.status(200).json({
            data: theatre,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getTheatreById = getTheatreById;
const addTheatre = async (req, res) => {
    try {
        const user = req.user;
        const { status, message, data } = await theatreService.addTheatre(req.body, user);
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
exports.addTheatre = addTheatre;
const updateTheatre = async (req, res) => {
    try {
        const theatreId = parseInt(req.params.id);
        const user = req.user;
        const { status, message, data } = await theatreService.updateTheatre(theatreId, req.body, user);
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
exports.updateTheatre = updateTheatre;
const deleteTheatre = async (req, res) => {
    try {
        const theatreId = parseInt(req.params.id);
        const user = req.user;
        const { status, message } = await theatreService.deleteTheatre(theatreId, user);
        res.status(status).json({
            status,
            message,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.deleteTheatre = deleteTheatre;
//# sourceMappingURL=theatre.controller.js.map