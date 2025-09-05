import dayjs from "dayjs";
import { AppDataSource } from "../data-source";
import { Booking } from "../entity/Booking";
import { Movie } from "../entity/Movie";
import { Schedule } from "../entity/Schedule";
import { Theatre } from "../entity/Theatre";
import { MovieStatus } from "../types/MovieType";
import { In } from "typeorm";

export class ReportService {
  private movieRepo = AppDataSource.getRepository(Movie);
  private theatreRepo = AppDataSource.getRepository(Theatre);
  private scheduleRepo = AppDataSource.getRepository(Schedule);
  private bookingRepo = AppDataSource.getRepository(Booking);

  async getCardInfo() {
    const [, movieTotal] = await this.movieRepo.findAndCount();

    const [, showingMovieTotal] = await this.movieRepo.findAndCount({
      where: {
        status: In([MovieStatus.nowShowing, MovieStatus.ticketAvailable]),
      },
    });

    const [, theatreTotal] = await this.theatreRepo.findAndCount();

    const [, scheduleTotal] = await this.scheduleRepo.findAndCount();

    // Revenue (better: let DB handle the sum if supported)
    const bookings = await this.bookingRepo.find({ select: ["totalAmount"] });
    const totalRevenue = bookings.reduce(
      (sum, b) => sum + Number(b.totalAmount),
      0,
    );

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
      .where("booking.status = :status", { status: "confirmed" }) // optional filter
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
      },
    };
  }

  async recentRecords() {
    const today = dayjs().format("YYYY-MM-DD");
    const upcomingSchedules = await this.scheduleRepo
      .createQueryBuilder("schedule")
      .innerJoin("schedule.movie", "movie")
      .innerJoin("schedule.theatre", "theatre")
      .innerJoin("schedule.screen", "screen")
      .select("schedule.id", "id")
      .addSelect("schedule.showDate", "showDate")
      .addSelect("schedule.showTime", "showTime")
      .addSelect("schedule.bookedSeats", "bookedSeats")
      .addSelect("schedule.availableSeats", "availableSeats")
      .addSelect("schedule.isActive", "isActive")
      .addSelect("movie.title", "movieTitle")
      .addSelect("theatre.name", "theatreName")
      .addSelect("screen.name", "screenName")
      .where("schedule.showDate > :today", { today })
      .orderBy("schedule.showDate", "DESC")
      .take(5)
      .getRawMany();

    const recentBookings = await this.bookingRepo
      .createQueryBuilder("booking")
      .innerJoin("booking.schedule", "schedule")
      .innerJoin("schedule.movie", "movie")
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
      .take(5)
      .getRawMany();

    // await this.bookingRepo.findAndCount({
    //   relations: ["schedule", "schedule.movie"],
    //   take: 10,
    //   order: {
    //     ["bookingDate"]: "DESC",
    //   },
    // });

    return {
      status: 200,
      data: {
        upcomingSchedules: upcomingSchedules.slice(0, 5),
        recentBookings: recentBookings.slice(0, 5),
      },
    };
  }
}
