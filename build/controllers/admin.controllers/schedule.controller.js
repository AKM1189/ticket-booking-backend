"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSchedule = exports.updateSchedule = exports.addSchedule = exports.getShowTime = exports.getShowDate = exports.getScheduleByShowDetail = exports.getSchedules = void 0;
const schedule_service_1 = require("../../services/admin.service/schedule.service");
const queryParams_1 = require("../../utils/queryParams");
const scheduleService = new schedule_service_1.ScheduleService();
const getSchedules = async (req, res) => {
    try {
        const user = req.user;
        const { page, limit, sortBy, sortOrder, search } = (0, queryParams_1.getQueryParams)(req, 1, 10, "id");
        const date = req.query.date;
        const { status, data, pagination } = await scheduleService.getSchedule(page, limit, sortBy, sortOrder, search, date, user);
        res.status(status).json({
            data,
            pagination,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getSchedules = getSchedules;
const getScheduleByShowDetail = async (req, res) => {
    try {
        const movieId = req.query.movieId;
        const theatreId = req.query.theatreId;
        const screenId = req.query.screenId;
        const showDate = req.query.showDate;
        const showTime = req.query.showTime;
        const { status, data } = await scheduleService.getScheduleByShowDetail(movieId, theatreId, screenId, showDate, showTime);
        res.status(status).json({
            data,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getScheduleByShowDetail = getScheduleByShowDetail;
const getShowDate = async (req, res) => {
    try {
        const movieId = req.query.movieId;
        const theatreId = req.query.theatreId;
        const screenId = req.query.screenId;
        const { status, data } = await scheduleService.getShowDate(movieId, theatreId, screenId);
        res.status(status).json({
            data,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getShowDate = getShowDate;
const getShowTime = async (req, res) => {
    try {
        const movieId = req.query.movieId;
        const theatreId = req.query.theatreId;
        const screenId = req.query.screenId;
        const showDate = req.query.showDate;
        const { status, data } = await scheduleService.getShowTime(movieId, theatreId, screenId, showDate);
        res.status(status).json({
            data,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getShowTime = getShowTime;
const addSchedule = async (req, res) => {
    try {
        const user = req.user;
        const { status, message, data } = await scheduleService.addSchedule(req.body, user);
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
exports.addSchedule = addSchedule;
const updateSchedule = async (req, res) => {
    const scheduleId = parseInt(req.params.id);
    try {
        const user = req.user;
        const { status, message, data } = await scheduleService.updateSchedule(scheduleId, req.body, user);
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
exports.updateSchedule = updateSchedule;
const deleteSchedule = async (req, res) => {
    try {
        const user = req.user;
        const scheduleId = parseInt(req.params.id);
        const { status, message } = await scheduleService.deleteSchedule(scheduleId, user);
        res.status(status).json({
            status,
            message,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.deleteSchedule = deleteSchedule;
//# sourceMappingURL=schedule.controller.js.map