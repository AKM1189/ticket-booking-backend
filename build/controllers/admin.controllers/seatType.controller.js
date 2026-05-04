"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSeatType = exports.updateSeatType = exports.addSeatType = exports.getSeatTypes = void 0;
const queryParams_1 = require("../../utils/queryParams");
const seatType_service_1 = require("../../services/admin.service/seatType.service");
const seatTypeService = new seatType_service_1.SeatTypeService();
const getSeatTypes = async (req, res) => {
    try {
        const { page, limit, sortBy, sortOrder } = (0, queryParams_1.getQueryParams)(req, 1, 10, "id");
        const { status, data, pagination } = await seatTypeService.getSeatTypes(page, limit, sortBy, sortOrder);
        res.status(status).json({
            data,
            pagination,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getSeatTypes = getSeatTypes;
const addSeatType = async (req, res) => {
    try {
        const { status, message, data } = await seatTypeService.addSeatType(req.body);
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
exports.addSeatType = addSeatType;
const updateSeatType = async (req, res) => {
    try {
        const typeId = parseInt(req.params.id);
        const { status, message, data } = await seatTypeService.updateSeatType(typeId, req.body);
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
exports.updateSeatType = updateSeatType;
const deleteSeatType = async (req, res) => {
    try {
        const typeId = parseInt(req.params.id);
        const { status, message } = await seatTypeService.deleteSeatType(typeId);
        res.status(status).json({
            status,
            message,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.deleteSeatType = deleteSeatType;
//# sourceMappingURL=seatType.controller.js.map