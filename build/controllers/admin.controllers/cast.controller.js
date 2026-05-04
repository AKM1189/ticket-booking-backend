"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCast = exports.updateCast = exports.addCast = exports.getCastById = exports.getAllCast = exports.getCast = void 0;
const data_source_1 = require("../../data-source");
const queryParams_1 = require("../../utils/queryParams");
const Cast_1 = require("../../entity/Cast");
const cast_service_1 = require("../../services/admin.service/cast.service");
const cast_formatter_1 = require("../../utils/response-formatter/cast.formatter");
const castService = new cast_service_1.CastService();
const getCast = async (req, res) => {
    try {
        const { page, limit, sortBy, sortOrder, search } = (0, queryParams_1.getQueryParams)(req, 1, 10, "id");
        const { status, data, pagination } = await castService.getCast(page, limit, sortBy, sortOrder, search);
        res.status(status).json({
            data: (0, cast_formatter_1.formatCasts)(data),
            pagination,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getCast = getCast;
const getAllCast = async (req, res) => {
    try {
        const { status, data } = await castService.getAllCast();
        res.status(status).json({
            data: (0, cast_formatter_1.formatCasts)(data),
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getAllCast = getAllCast;
const getCastById = async (req, res) => {
    try {
        const castRepo = data_source_1.AppDataSource.getRepository(Cast_1.Cast);
        const id = parseInt(req.params.id);
        const cast = await castRepo.findOneBy({ id });
        if (!cast) {
            res.status(404).json({ message: "Cast not found" });
        }
        res.status(200).json({
            data: (0, cast_formatter_1.formatCast)(cast),
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getCastById = getCastById;
const addCast = async (req, res) => {
    const files = req.files;
    try {
        const { status, message, data } = await castService.addCast(req.body, files);
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
exports.addCast = addCast;
const updateCast = async (req, res) => {
    const files = req.files;
    try {
        const castId = parseInt(req.params.id);
        const { status, message } = await castService.updateCast(castId, req.body, files);
        res.status(status).json({
            status,
            message,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.updateCast = updateCast;
const deleteCast = async (req, res) => {
    try {
        const castId = parseInt(req.params.id);
        const { status, message } = await castService.deleteCast(castId);
        res.status(status).json({
            status,
            message,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.deleteCast = deleteCast;
//# sourceMappingURL=cast.controller.js.map