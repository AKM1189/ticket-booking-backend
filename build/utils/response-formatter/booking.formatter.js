"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatBookings = exports.formatBooking = void 0;
const movie_formatter_1 = require("./movie.formatter");
const user_formatter_1 = require("./user.formatter");
const formatBooking = (booking) => {
    if (!booking)
        return booking;
    return {
        ...booking,
        movie: (0, movie_formatter_1.formatMovie)(booking.schedule.movie),
        user: (0, user_formatter_1.formatUser)(booking.user),
    };
};
exports.formatBooking = formatBooking;
const formatBookings = (bookings) => {
    return bookings.map(exports.formatBooking);
};
exports.formatBookings = formatBookings;
//# sourceMappingURL=booking.formatter.js.map