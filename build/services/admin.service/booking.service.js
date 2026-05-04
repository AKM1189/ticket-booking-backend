"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const data_source_1 = require("../../data-source");
const Booking_1 = require("../../entity/Booking");
const Schedule_1 = require("../../entity/Schedule");
const Screen_1 = require("../../entity/Screen");
const User_1 = require("../../entity/User");
const ScheduleType_1 = require("../../types/ScheduleType");
const generateTicket_1 = require("../../utils/generateTicket");
const typeorm_1 = require("typeorm");
const addNoti_1 = require("../../utils/addNoti");
const constants_1 = require("../../constants");
const AuthType_1 = require("../../types/AuthType");
class BookingService {
    scheduleRepo = data_source_1.AppDataSource.getRepository(Schedule_1.Schedule);
    bookingRepo = data_source_1.AppDataSource.getRepository(Booking_1.Booking);
    userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
    screenRepo = data_source_1.AppDataSource.getRepository(Screen_1.Screen);
    async getBookings(page, limit, sortBy, sortOrder, staffID, date, search, bookingStatus) {
        let whereClause = {};
        let staff = null;
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
                bookingDate: (0, typeorm_1.Between)(startOfDay, endOfDay),
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
                    id: (0, typeorm_1.Like)(`%${search}%`),
                    ...whereClause,
                    ...staffWithoutSchedule,
                },
                {
                    schedule: {
                        movie: { title: (0, typeorm_1.Like)(`%${search}%`) },
                        ...staffWithSchedule,
                    },
                    ...whereClause,
                },
                {
                    schedule: {
                        theatre: {
                            name: (0, typeorm_1.Like)(`%${search}%`),
                            ...(staff ? { id: staff?.theatre?.id } : {}),
                        },
                    },
                    ...whereClause,
                },
                {
                    schedule: {
                        screen: { name: (0, typeorm_1.Like)(`%${search}%`) },
                        ...staffWithSchedule,
                    },
                    ...whereClause,
                },
                {
                    customerName: (0, typeorm_1.Like)(`%${search}%`),
                    ...whereClause,
                    ...staffWithoutSchedule,
                },
                {
                    customerEmail: (0, typeorm_1.Like)(`%${search}%`),
                    ...whereClause,
                    ...staffWithoutSchedule,
                },
                {
                    user: { role: (0, typeorm_1.Like)(`%${search}%`) },
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
                ? whereClause.map((wc) => ({ ...wc, status: (0, typeorm_1.Not)("cancelled") }))
                : { ...whereClause, status: (0, typeorm_1.Not)("cancelled") },
        });
        const confirmed = confirmedBookings.length;
        const totalRevenue = confirmedBookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
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
                bookingDate: (0, typeorm_1.Between)(startOfDay, endOfDay),
                status: (0, typeorm_1.Not)("cancelled"),
                ...(staffID ? { user: { id: parseInt(staffID) } } : {}),
            },
        });
        const todayRevenue = todayBookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
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
    async getBookingById(bookingId) {
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
        const bookedSeatTypes = await this.screenRepo.findOne({
            relations: ["seatTypes.seatType"],
            where: { id: booking.schedule.screen.id },
        });
        const bookedSeats = booking.seatList;
        const seatTypeList = bookedSeatTypes.seatTypes;
        const { showDate, showTime, multiplier, language, subtitle } = booking.schedule;
        const { title, status, experience } = booking.schedule.movie;
        const { name: theatreName, location, region, city, } = booking.schedule.theatre;
        const { name: screenName, multiplier: screenMultiplier, type, } = booking.schedule.screen;
        const newTypeList = bookedSeats?.map((seat) => {
            const bookedType = seatTypeList?.find((screenSeatType) => screenSeatType.seatList.includes(seat[0]));
            if (bookedType) {
                const seatPrice = bookedType.seatType.price * screenMultiplier * multiplier;
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
    async getBookingByUserId(userId) {
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
                bookingDate: "DESC",
            },
        });
        if (!bookings.length) {
            return {
                status: 404,
                message: "No bookings found for this user",
            };
        }
        const formattedBookings = await Promise.all(bookings.map(async (booking) => {
            const bookedSeatTypes = await this.screenRepo.findOne({
                relations: ["seatTypes.seatType"],
                where: { id: booking.schedule.screen.id },
            });
            const bookedSeats = booking.seatList;
            const seatTypeList = bookedSeatTypes?.seatTypes || [];
            const { showDate, showTime, multiplier, language, subtitle } = booking.schedule;
            const { title, status, experience } = booking.schedule.movie;
            const { name: theatreName, location, region, city, } = booking.schedule.theatre;
            console.log("theatreName", theatreName);
            const { name: screenName, multiplier: screenMultiplier, type, } = booking.schedule.screen;
            const newTypeList = bookedSeats
                ?.map((seat) => {
                const bookedType = seatTypeList.find((screenSeatType) => screenSeatType.seatList.includes(seat[0]));
                console.log("bookedType", bookedType);
                if (bookedType) {
                    const seatPrice = bookedType.seatType.price * screenMultiplier * multiplier;
                    return {
                        seatId: seat,
                        type: bookedType.seatType.name,
                        price: parseFloat(seatPrice.toString()).toFixed(2),
                    };
                }
                return null;
            })
                .filter(Boolean);
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
        }));
        return {
            status: 200,
            data: formattedBookings,
        };
    }
    async addBooking(body) {
        const { scheduleId, selectedSeats, customerName, customerEmail, customerPhone, note, userId, totalAmount, } = body;
        const schedule = await this.scheduleRepo.findOne({
            relations: ["theatre", "movie"],
            where: { id: parseInt(scheduleId) },
        });
        const user = await this.userRepo.findOneBy({
            id: parseInt(userId),
        });
        if (schedule.status === ScheduleType_1.ScheduleStatus.inActive ||
            schedule.status === ScheduleType_1.ScheduleStatus.completed) {
            throw new Error("This schedules is currently unavailable!.");
        }
        // if(schedule.bookedSeats)
        if (schedule.bookedSeats) {
            const isAlreadyBooked = schedule.bookedSeats?.some((seat) => selectedSeats?.includes(seat));
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
        const booking = await (0, generateTicket_1.generateTicket)(updatedBooking, show);
        // admin - all noti (role)
        // staff - theatre only noti ( role, theatreId)
        const message = `${user?.name} booked ${selectedSeats?.length} seats for '${schedule?.movie?.title.toUpperCase()}' at ${schedule?.showDate}, ${schedule?.showTime.slice(0, 5)}.`;
        const userMessage = `Your booking for '${schedule?.movie?.title.toUpperCase()}' at ${schedule?.showDate}, ${schedule?.showTime.slice(0, 5)} has been confirmed.`;
        if (user.role === AuthType_1.Role.user && booking.user.id === user.id) {
            (0, addNoti_1.addUserNotification)(constants_1.NOTI_TYPE.NEW_BOOKING, "Booking Confirmed", userMessage, user.id);
        }
        (0, addNoti_1.addNotification)(constants_1.NOTI_TYPE.NEW_BOOKING, "New Booking", message, user?.id, schedule?.theatre?.id);
        return {
            status: 200,
            message: "Booking added successfully",
            data: booking.id,
        };
    }
    async cancelBooking(bookingId, body, user) {
        const intBookingId = parseInt(bookingId);
        const { reason } = body;
        const booking = await this.bookingRepo.findOne({
            relations: ["user"],
            where: { id: intBookingId },
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
        const updatedBookedSeats = schedule.bookedSeats.filter((seat) => !booking.seatList.includes(seat));
        const updatedSchedule = {
            ...schedule,
            bookedSeats: updatedBookedSeats,
        };
        await this.bookingRepo.save(updatedBooking);
        await this.scheduleRepo.save(updatedSchedule);
        const message = `${user?.name} cancelled BookingID(${bookingId}).`;
        const userMessage = `Your booking for '${schedule.movie?.title.toUpperCase()}' at ${schedule.theatre.location} on ${schedule?.showDate}, ${schedule?.showTime.slice(0, 5)} has been cancelled.`;
        if (user.role === AuthType_1.Role.user && booking.user.id === user.id) {
            (0, addNoti_1.addUserNotification)(constants_1.NOTI_TYPE.CANCEL_BOOKING, "Booking Cancelled", userMessage, user.id);
        }
        (0, addNoti_1.addNotification)(constants_1.NOTI_TYPE.CANCEL_BOOKING, "Booking Cancelled", message, user.id, schedule?.theatre?.id);
        return {
            status: 200,
            message: "Booking cancelled successfully",
        };
    }
}
exports.BookingService = BookingService;
//# sourceMappingURL=booking.service.js.map