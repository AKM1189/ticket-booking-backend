import { Booking } from "../../entity/Booking";
import { formatMovie } from "./movie.formatter";
import { formatUser } from "./user.formatter";

export const formatBooking = (booking: Booking) => {
  if (!booking) return booking;

  return {
    ...booking,
    movie: formatMovie(booking.schedule.movie),
    user: formatUser(booking.user),
  };
};

export const formatBookings = (bookings: Booking[]) => {
  return bookings.map(formatBooking);
};
