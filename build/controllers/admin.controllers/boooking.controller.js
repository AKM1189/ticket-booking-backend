"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelBooking = exports.addBooking = exports.getBookingByUserId = exports.getBookingById = exports.getBookings = void 0;
const queryParams_1 = require("../../utils/queryParams");
const booking_service_1 = require("../../services/admin.service/booking.service");
const bookingService = new booking_service_1.BookingService();
const getBookings = async (req, res) => {
    try {
        const { page, limit, sortBy, sortOrder, search, status: bookingStatus, } = (0, queryParams_1.getQueryParams)(req, 1, 10, "id");
        const staffID = req.query.staffID;
        const date = req.query.date;
        const { status, data, stats, pagination } = await bookingService.getBookings(page, limit, "bookingDate", "DESC", staffID, date, search, bookingStatus);
        res.status(status).json({
            data,
            stats,
            pagination,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getBookings = getBookings;
const getBookingById = async (req, res) => {
    try {
        const bookingID = req.params.id;
        const { status, data } = await bookingService.getBookingById(parseInt(bookingID));
        res.status(status).json({
            data,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getBookingById = getBookingById;
const getBookingByUserId = async (req, res) => {
    try {
        const userId = req.params.id;
        const { status, data } = await bookingService.getBookingByUserId(parseInt(userId));
        res.status(status).json({
            data,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getBookingByUserId = getBookingByUserId;
const addBooking = async (req, res) => {
    try {
        const { status, message, data } = await bookingService.addBooking(req.body);
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
exports.addBooking = addBooking;
const cancelBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const user = req.user;
        const { status, message } = await bookingService.cancelBooking(bookingId, req.body, user);
        res.status(status).json({
            status,
            message,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.cancelBooking = cancelBooking;
//# sourceMappingURL=boooking.controller.js.map