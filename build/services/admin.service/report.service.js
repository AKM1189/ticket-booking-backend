"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const data_source_1 = require("../../data-source");
const Booking_1 = require("../../entity/Booking");
const Movie_1 = require("../../entity/Movie");
const Schedule_1 = require("../../entity/Schedule");
const Theatre_1 = require("../../entity/Theatre");
const MovieType_1 = require("../../types/MovieType");
const typeorm_1 = require("typeorm");
const AuthType_1 = require("../../types/AuthType");
const ScheduleType_1 = require("../../types/ScheduleType");
class ReportService {
    movieRepo = data_source_1.AppDataSource.getRepository(Movie_1.Movie);
    theatreRepo = data_source_1.AppDataSource.getRepository(Theatre_1.Theatre);
    scheduleRepo = data_source_1.AppDataSource.getRepository(Schedule_1.Schedule);
    bookingRepo = data_source_1.AppDataSource.getRepository(Booking_1.Booking);
    async getCardInfo(user) {
        const [, movieTotal] = await this.movieRepo.findAndCount();
        const [, showingMovieTotal] = await this.movieRepo.findAndCount({
            where: {
                status: (0, typeorm_1.In)([MovieType_1.MovieStatus.nowShowing, MovieType_1.MovieStatus.ticketAvailable]),
            },
        });
        const [, theatreTotal] = await this.theatreRepo.findAndCount();
        const [, scheduleTotal] = await this.scheduleRepo.findAndCount();
        // Revenue (better: let DB handle the sum if supported)
        const bookings = await this.bookingRepo.find({
            select: ["totalAmount"],
            where: { status: (0, typeorm_1.Not)("cancelled") },
        });
        const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        const whereClause = user?.role === AuthType_1.Role.staff
            ? { user: { id: user?.id }, bookingDate: (0, typeorm_1.Between)(startOfDay, endOfDay) }
            : { bookingDate: (0, typeorm_1.Between)(startOfDay, endOfDay) };
        const [, todayTicketSales] = await this.bookingRepo.findAndCount({
            where: whereClause,
        });
        // get last 7 day revenue
        const result = await this.bookingRepo
            .createQueryBuilder("booking")
            .select("DATE(booking.bookingDate)", "date") // group by date
            .addSelect("SUM(booking.totalAmount)", "revenue")
            .where("booking.bookingDate >= :startDate", {
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        })
            .groupBy("DATE(booking.bookingDate)")
            .orderBy("date", "ASC")
            .getRawMany();
        // Convert to nicer format
        const lastSevenDayRevenue = result.map((row) => ({
            date: new Date(row.date).toLocaleDateString(),
            revenue: parseInt(row.revenue),
        }));
        const monthlyRevenue = await this.bookingRepo
            .createQueryBuilder("booking")
            .select("DATE_FORMAT(booking.bookingDate, '%Y-%m')", "month")
            .addSelect("SUM(booking.totalAmount)", "revenue")
            .where("booking.status IN (:...status)", {
            status: ["confirmed", "completed"],
        })
            // optional filter
            .andWhere("booking.bookingDate >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)")
            .groupBy("DATE_FORMAT(booking.bookingDate, '%Y-%m')")
            .orderBy("month", "ASC")
            .getRawMany();
        const showingMovieBookings = await this.bookingRepo
            .createQueryBuilder("booking")
            .innerJoin("booking.schedule", "schedule")
            .innerJoin("schedule.movie", "movie")
            .select("movie.title", "movieTitle")
            .addSelect("COUNT(booking.id)", "bookingCount")
            .where("movie.status = :status", { status: "Now Showing" })
            .andWhere("booking.status != :bookingStatus", {
            bookingStatus: "cancelled",
        })
            .groupBy("movie.id")
            .orderBy("bookingCount", "DESC")
            .getRawMany();
        const availableMovieBookings = await this.bookingRepo
            .createQueryBuilder("booking")
            .innerJoin("booking.schedule", "schedule")
            .innerJoin("schedule.movie", "movie")
            .select("movie.title", "movieTitle")
            .addSelect("COUNT(booking.id)", "bookingCount")
            .where("movie.status = :status", { status: "Ticket Available" })
            .andWhere("booking.status != :bookingStatus", {
            bookingStatus: "cancelled",
        })
            .groupBy("movie.id")
            .orderBy("COUNT(booking.id)", "DESC")
            .getRawMany();
        return {
            status: 200,
            data: {
                totalMovies: movieTotal,
                activeMovies: showingMovieTotal,
                totalTheatres: theatreTotal,
                totalSchedules: scheduleTotal,
                totalRevenue,
                lastSevenDayRevenue,
                monthlyRevenue,
                showingMovieBookings,
                availableMovieBookings,
                todayTicketSales,
            },
        };
    }
    async recentRecords(user) {
        const today = (0, dayjs_1.default)().format("YYYY-MM-DD");
        const schedulesQuery = this.scheduleRepo
            .createQueryBuilder("schedule")
            .innerJoin("schedule.movie", "movie")
            .innerJoin("schedule.theatre", "theatre")
            .innerJoin("schedule.screen", "screen")
            .select("schedule.id", "id")
            .addSelect("schedule.showDate", "showDate")
            .addSelect("schedule.showTime", "showTime")
            .addSelect("schedule.bookedSeats", "bookedSeats")
            .addSelect("schedule.availableSeats", "availableSeats")
            .addSelect("schedule.status", "status")
            .addSelect("movie.title", "movieTitle")
            .addSelect("theatre.location", "theatreName")
            .addSelect("screen.name", "screenName")
            .where("schedule.showDate > :today", { today })
            .andWhere("schedule.status NOT IN (:...excluded)", {
            excluded: [ScheduleType_1.ScheduleStatus.completed, ScheduleType_1.ScheduleStatus.inActive],
        })
            .orderBy("schedule.showDate", "DESC")
            .take(5);
        if (user?.role === AuthType_1.Role.staff) {
            schedulesQuery.andWhere("theatre.id = :theatreId", {
                theatreId: user.theatre.id,
            });
        }
        const query = this.bookingRepo
            .createQueryBuilder("booking")
            .innerJoin("booking.schedule", "schedule")
            .innerJoin("schedule.movie", "movie")
            .innerJoin("booking.user", "user")
            .select("booking.id", "id")
            .addSelect("booking.customerName", "customerName")
            .addSelect("booking.customerEmail", "customerEmail")
            .addSelect("booking.seatList", "seatList")
            .addSelect("booking.totalAmount", "totalAmount")
            .addSelect("booking.status", "status")
            .addSelect("booking.bookingDate", "bookingDate")
            .addSelect("schedule.showDate", "showDate")
            .addSelect("schedule.showTime", "showTime")
            .addSelect("movie.title", "movieTitle")
            .orderBy("booking.bookingDate", "DESC")
            .addOrderBy("booking.id", "DESC") // secondary order to ensure stable limit
            .take(5);
        if (user?.role === AuthType_1.Role.staff) {
            query.andWhere("user.id = :userId", { userId: user.id });
        }
        const recentBookings = await query.getRawMany();
        const upcomingSchedules = await schedulesQuery.getRawMany();
        return {
            status: 200,
            data: {
                upcomingSchedules: upcomingSchedules.slice(0, 5),
                recentBookings: recentBookings.slice(0, 5),
            },
        };
    }
}
exports.ReportService = ReportService;
//# sourceMappingURL=report.service.js.map