import dayjs from "dayjs";
import { AppDataSource } from "../../data-source";
import { Booking } from "../../entity/Booking";
import { Movie } from "../../entity/Movie";
import { Schedule } from "../../entity/Schedule";
import { Screen } from "../../entity/Screen";
import { Theatre } from "../../entity/Theatre";
import { Ticket } from "../../entity/Ticket";
import { User } from "../../entity/User";
import { BookingType } from "../../types/BookingType";
import { ScheduleStatus } from "../../types/ScheduleType";
import { generateTicket } from "../../utils/generateTicket";
import { Between, Like } from "typeorm";
import { addNotification, addUserNotification } from "../../utils/addNoti";
import { NOTI_TYPE } from "../../constants";
import { Role } from "../../types/AuthType";

export class BookingService {
  private scheduleRepo = AppDataSource.getRepository(Schedule);
  private bookingRepo = AppDataSource.getRepository(Booking);
  private userRepo = AppDataSource.getRepository(User);
  private screenRepo = AppDataSource.getRepository(Screen);

  async getBookings(
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: string,
    staffID: string | null,
    date: string,
    search: string,
    bookingStatus: string,
  ) {
    let whereClause: any = {};
    let staff: User | null = null;

    if (staffID) {
      staff = await this.userRepo.findOne({
        relations: ["theatre"],
        where: { id: parseInt(staffID) },
      });
    }

    if (date) {
      // Create Date objects at 00:00:00 and 23:59:59 of that day
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);
      whereClause = {
        ...whereClause,
        bookingDate: Between(startOfDay, endOfDay),
      };
    }

    if (bookingStatus) {
      whereClause = { ...whereClause, status: bookingStatus };
    }

    if (search) {
      const staffWithSchedule = staff
        ? { theatre: { id: staff?.theatre?.id } }
        : {};
      const staffWithoutSchedule = staff
        ? { schedule: { theatre: { id: staff?.theatre?.id } } }
        : {};
      whereClause = [
        {
          id: Like(`%${search}%`),
          ...whereClause,
          ...staffWithoutSchedule,
        },
        {
          schedule: {
            movie: { title: Like(`%${search}%`) },
            ...staffWithSchedule,
          },
          ...whereClause,
        },
        {
          schedule: {
            theatre: {
              name: Like(`%${search}%`),
              ...(staff ? { id: staff?.theatre?.id } : {}),
            },
          },
          ...whereClause,
        },
        {
          schedule: {
            screen: { name: Like(`%${search}%`) },
            ...staffWithSchedule,
          },
          ...whereClause,
        },
        {
          customerName: Like(`%${search}%`),
          ...whereClause,
          ...staffWithoutSchedule,
        },
        {
          customerEmail: Like(`%${search}%`),
          ...whereClause,
          ...staffWithoutSchedule,
        },
        {
          user: { role: Like(`%${search}%`) },
          ...whereClause,
          ...staffWithoutSchedule,
        },
      ];
    }

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
      where: Array.isArray(whereClause)
        ? whereClause
        : {
          ...whereClause,
          ...(staff
            ? { schedule: { theatre: { id: staff?.theatre?.id } } }
            : {}),
        },
    });

    const confirmedBookings = await this.bookingRepo.find({
      select: ["totalAmount"],
      where: Array.isArray(whereClause)
        ? whereClause.map((wc) => ({ ...wc, status: "confirmed" }))
        : { ...whereClause, status: "confirmed" },
    });
    const confirmed = confirmedBookings.length;
    const totalRevenue = confirmedBookings.reduce(
      (sum, b) => sum + Number(b.totalAmount),
      0,
    );

    const cancelledBookings = await this.bookingRepo.find({
      select: ["totalAmount"],
      where: Array.isArray(whereClause)
        ? whereClause.map((wc) => ({ ...wc, status: "cancelled" }))
        : { ...whereClause, status: "cancelled" },
    });
    const cancelled = cancelledBookings.length;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    const todayBookings = await this.bookingRepo.find({
      select: ["totalAmount"],
      where: {
        bookingDate: Between(startOfDay, endOfDay),
        ...(staffID ? { user: { id: parseInt(staffID) } } : {}),
      },
    });
    const todayRevenue = todayBookings.reduce(
      (sum, b) => sum + Number(b.totalAmount),
      0,
    );

    return {
      status: 200,
      data: bookings,
      stats: {
        total,
        confirmed: bookingStatus === "cancelled" ? 0 : confirmed,
        cancelled: bookingStatus === "confirmed" ? 0 : cancelled,
        totalRevenue,
        todayRevenue,
      },
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
      const bookedType = seatTypeList?.find((screenSeatType) =>
        screenSeatType.seatList.includes(seat[0]),
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

  async getBookingByUserId(userId: number) {
    const bookings = await this.bookingRepo.find({
      relations: [
        "user",
        "schedule",
        "schedule.movie",
        "schedule.theatre",
        "schedule.screen",
        "ticket",
      ],
      where: { user: { id: userId } },
      order: {
        bookingDate: "DESC"
      }
    });

    if (!bookings.length) {
      return {
        status: 404,
        message: "No bookings found for this user",
      };
    }

    const formattedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const bookedSeatTypes = await this.screenRepo.findOne({
          relations: ["seatTypes.seatType"],
          where: { id: booking.schedule.screen.id },
        });

        const bookedSeats = booking.seatList;
        const seatTypeList = bookedSeatTypes?.seatTypes || [];

        const { showDate, showTime, multiplier, language, subtitle } =
          booking.schedule;
        const { title, status, experience } = booking.schedule.movie;
        const { name: theatreName, location, region, city } =
          booking.schedule.theatre;
        console.log('theatreName', theatreName)

        const { name: screenName, multiplier: screenMultiplier, type } =
          booking.schedule.screen;

        const newTypeList = bookedSeats?.map((seat) => {
          const bookedType = seatTypeList.find((screenSeatType) =>
            screenSeatType.seatList.includes(seat[0]),
          );
          console.log('bookedType', bookedType)

          if (bookedType) {
            const seatPrice =
              bookedType.seatType.price * screenMultiplier * multiplier;
            return {
              seatId: seat,
              type: bookedType.seatType.name,
              price: parseFloat(seatPrice.toString()).toFixed(2),
            };
          }

          return null;
        }).filter(Boolean);



        return {
          id: booking.id,
          totalAmount: booking.totalAmount,
          ticket: booking.ticket,
          status: booking.status,
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
      }),
    );

    return {
      status: 200,
      data: formattedBookings,
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

    const schedule = await this.scheduleRepo.findOne({
      relations: ["theatre", "movie"],
      where: { id: parseInt(scheduleId) },
    });

    const user = await this.userRepo.findOneBy({
      id: parseInt(userId),
    });

    if (
      schedule.status === ScheduleStatus.inActive ||
      schedule.status === ScheduleStatus.completed
    ) {
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

    // admin - all noti (role)
    // staff - theatre only noti ( role, theatreId)

    const message = `${user?.name} booked ${selectedSeats?.length
      } seats for '${schedule?.movie?.title.toUpperCase()}' at ${schedule?.showDate
      }, ${schedule?.showTime.slice(0, 5)}.`;

    const userMessage = `Your booking for '${schedule?.movie?.title.toUpperCase()}' at ${schedule?.showDate
      }, ${schedule?.showTime.slice(0, 5)} has been confirmed.`;


    if (user.role === Role.user && booking.user.id === user.id) {
      addUserNotification(
        NOTI_TYPE.NEW_BOOKING,
        "Booking Confirmed",
        userMessage,
        user.id,
      )
    }

    addNotification(
      NOTI_TYPE.NEW_BOOKING,
      "New Booking",
      message,
      user?.id,
      schedule?.theatre?.id,
    );

    return {
      status: 200,
      message: "Booking added successfully",
      data: booking.id,
    };
  }

  async cancelBooking(bookingId: string, body: { reason: string }, user: User) {
    const intBookingId = parseInt(bookingId);
    const { reason } = body;

    const booking = await this.bookingRepo.findOne({
      relations: ['user'],
      where: { id: intBookingId }
    });

    const schedule = await this.scheduleRepo.findOne({
      relations: ["theatre", "movie"],
      where: { bookings: { id: intBookingId } },
    });

    if (!booking) {
      throw new Error("Booking not found!");
    }

    const updatedBooking = {
      ...booking,
      cancelledReason: reason,
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

    const message = `${user?.name} cancelled BookingID(${bookingId}).`;

    const userMessage = `Your booking for '${schedule.movie?.title.toUpperCase()}' at ${schedule.theatre.name
      } on ${schedule?.showDate}, ${schedule?.showTime.slice(0, 5)} has been cancelled.`;

    if (user.role === Role.user && booking.user.id === user.id) {
      addUserNotification(
        NOTI_TYPE.CANCEL_BOOKING,
        "Booking Cancelled",
        userMessage,
        user.id,
      )
    }

    addNotification(
      NOTI_TYPE.CANCEL_BOOKING,
      "Booking Cancelled",
      message,
      user.id,
      schedule?.theatre?.id,
    );

    return {
      status: 200,
      message: "Booking cancelled successfully",
    };
  }
}
