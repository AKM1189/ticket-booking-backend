"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTicket = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const Booking_1 = require("../entity/Booking");
const data_source_1 = require("../data-source");
const Ticket_1 = require("../entity/Ticket");
const generateTicket = async (booking, schedule) => {
    const ticketRepo = data_source_1.AppDataSource.getRepository(Ticket_1.Ticket);
    const bookingRepo = data_source_1.AppDataSource.getRepository(Booking_1.Booking);
    const ticketNumber = `TKT-${booking.id}${Date.now()}`;
    const qrCode = await qrcode_1.default.toDataURL(JSON.stringify({
        ticketNumber,
        bookingId: booking.id,
        showId: schedule.id,
    }));
    const newTicket = ticketRepo.create({
        ticketNumber,
        qrCode,
        issuedAt: new Date(),
    });
    const ticket = await ticketRepo.save(newTicket);
    booking.ticket = ticket;
    return await bookingRepo.save(booking);
};
exports.generateTicket = generateTicket;
//# sourceMappingURL=generateTicket.js.map