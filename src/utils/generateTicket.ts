import QRCode from "qrcode";
import { Booking } from "../entity/Booking";
import { Schedule } from "../entity/Schedule";
import { AppDataSource } from "../data-source";
import { Ticket } from "../entity/Ticket";

export const generateTicket = async (booking: Booking, schedule: Schedule) => {
  const ticketRepo = AppDataSource.getRepository(Ticket);
  const bookingRepo = AppDataSource.getRepository(Booking);

  const ticketNumber = `TKT-${booking.id}${Date.now()}`;

  const qrCode = await QRCode.toDataURL(
    JSON.stringify({
      ticketNumber,
      bookingId: booking.id,
      showId: schedule.id,
    }),
  );

  const newTicket = {
    ticketNumber,
    qrCode,
    issueAt: new Date(),
  };

  const ticket = await ticketRepo.save(newTicket);
  booking.ticket = ticket;

  return await bookingRepo.save(booking);
};
