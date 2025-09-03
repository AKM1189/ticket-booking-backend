import { AppDataSource } from "../data-source";
import { Booking } from "../entity/Booking";
import { Movie } from "../entity/Movie";
import { Schedule } from "../entity/Schedule";
import { Screen } from "../entity/Screen";
import { Theatre } from "../entity/Theatre";
import { Ticket } from "../entity/Ticket";
import { User } from "../entity/User";
import { BookingType } from "../types/BookingType";
import { generateTicket } from "../utils/generateTicket";

export class BookingService {
  private movieRepo = AppDataSource.getRepository(Movie);
  private theatreRepo = AppDataSource.getRepository(Theatre);
  private scheduleRepo = AppDataSource.getRepository(Schedule);
  private bookingRepo = AppDataSource.getRepository(Booking);
  private userRepo = AppDataSource.getRepository(User);
  private ticketRepo = AppDataSource.getRepository(Ticket);
  private screenRepo = AppDataSource.getRepository(Screen);

  async getBookings(
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: string,
  ) {
    const [bookings, total] = await this.bookingRepo.findAndCount({
      relations: [
        "schedule",
        "user",
        "schedule.theatre",
        "schedule.screen",
        "schedule.movie",
        "ticket",
      ],
      order: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      status: 200,
      data: bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBookingById(bookingId: number) {
    const booking = await this.bookingRepo.findOne({
      relations: [
        "schedule",
        "schedule.movie",
        "schedule.theatre",
        "schedule.screen",
        "ticket",
      ],
      where: { id: bookingId },
    });

    const bookedSeatTypes: any = await this.screenRepo.findOne({
      relations: ["seatTypes.seatType"],
      where: { id: booking.schedule.screen.id },
    });

    const bookedSeats = booking.seatList;

    const seatTypeList = bookedSeatTypes.seatTypes;

    const { showDate, showTime, multiplier, language, subtitle } =
      booking.schedule;
    const { title, status, experience } = booking.schedule.movie;
    const {
      name: theatreName,
      location,
      region,
      city,
    } = booking.schedule.theatre;
    const {
      name: screenName,
      multiplier: screenMultiplier,
      type,
    } = booking.schedule.screen;

    const newTypeList = bookedSeats?.map((seat) => {
      const bookedType = seatTypeList?.find((type) =>
        type.seatList.includes(seat[0]),
      );
      if (bookedType) {
        const seatPrice =
          bookedType.seatType.price * screenMultiplier * multiplier;
        return {
          seatId: seat,
          type: bookedType.seatType.name,
          price: parseFloat(seatPrice.toString()).toFixed(2),
        };
      }
    });

    const formattedBooking = {
      id: booking.id,
      totalAmount: booking.totalAmount,
      ticket: booking.ticket,
      schedule: {
        showTime,
        showDate,
        language,
        subtitle,
      },
      movie: {
        title,
        status,
        experience,
      },
      theatre: {
        name: theatreName,
        location,
        region,
        city,
      },
      screen: {
        name: screenName,
        type,
      },
      seatList: newTypeList,
    };

    return {
      status: 200,
      data: formattedBooking,
    };
  }

  async addBooking(body: BookingType) {
    const {
      scheduleId,
      selectedSeats,
      customerName,
      customerEmail,
      customerPhone,
      note,
      userId,
      totalAmount,
    } = body;

    const existingBooking = await this.bookingRepo.find({
      where: { schedule: { id: parseInt(scheduleId) } },
    });

    const schedule = await this.scheduleRepo.findOneBy({
      id: parseInt(scheduleId),
    });

    const user = await this.userRepo.findOneBy({
      id: parseInt(userId),
    });

    if (!schedule.isActive) {
      throw new Error("This schedules is currently unavailable!.");
    }

    // if(schedule.bookedSeats)
    if (schedule.bookedSeats) {
      const isAlreadyBooked = schedule.bookedSeats?.some((seat) =>
        selectedSeats?.includes(seat),
      );

      if (isAlreadyBooked) {
        throw new Error("Some of the selected seats are already booked.");
      }
    }

    // if (existingBooking.length > 0) {
    //   const isAlreadyBooked = existingBooking.some((booking) =>
    //     booking.seatList.some((item) => selectedSeats.includes(item)),
    //   );

    const newBooking = this.bookingRepo.create({
      schedule,
      user,
      seatList: selectedSeats,
      totalAmount,
      customerName,
      customerEmail,
      customerPhone,
      note,
      status: "confirmed",
      bookingDate: new Date(),
    });

    const updatedSchedule = {
      ...schedule,
      bookedSeats: schedule.bookedSeats
        ? [...schedule.bookedSeats, ...selectedSeats]
        : selectedSeats,
    };

    const updatedBooking = await this.bookingRepo.save(newBooking);
    const show = await this.scheduleRepo.save(updatedSchedule);
    const booking = await generateTicket(updatedBooking, show);

    return {
      status: 200,
      message: "Booking added successfully",
      data: booking.id,
    };
  }

  async cancelBooking(bookingId: string) {
    const intBookingId = parseInt(bookingId);

    const booking = await this.bookingRepo.findOneBy({ id: intBookingId });

    const schedule = await this.scheduleRepo.findOne({
      where: { bookings: { id: intBookingId } },
    });

    if (!booking) {
      throw new Error("Booking not found!");
    }

    const updatedBooking = {
      ...booking,
      status: "cancelled",
    };

    const updatedBookedSeats = schedule.bookedSeats.filter(
      (seat) => !booking.seatList.includes(seat),
    );
    const updatedSchedule = {
      ...schedule,
      bookedSeats: updatedBookedSeats,
    };

    await this.bookingRepo.save(updatedBooking);
    await this.scheduleRepo.save(updatedSchedule);

    console.log("updatedBooking", updatedBooking);
    console.log("updatedSchedule", updatedSchedule);

    return {
      status: 200,
      message: "Booking cancelled successfully",
    };
  }
}
