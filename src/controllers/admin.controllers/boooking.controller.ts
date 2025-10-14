import { AppDataSource } from "../../data-source";
import { GenreService } from "../../services/admin.service/genre.service";
import { Request, Response } from "express";
import { getQueryParams } from "../../utils/queryParams";
import { Genre } from "../../entity/Genre";
import { BookingService } from "../../services/admin.service/booking.service";

const bookingService = new BookingService();

export const getBookings = async (req: Request, res: Response) => {
  try {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      status: bookingStatus,
    } = getQueryParams(req, 1, 10, "id");
    const staffID = req.query.staffID as string;
    const date = req.query.date as string;
    const { status, data, stats, pagination } =
      await bookingService.getBookings(
        page,
        limit,
        "bookingDate",
        "DESC",
        staffID,
        date,
        search,
        bookingStatus,
      );

    res.status(status).json({
      data,
      stats,
      pagination,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const bookingID = req.params.id as string;
    const { status, data } = await bookingService.getBookingById(
      parseInt(bookingID),
    );

    res.status(status).json({
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getBookingByUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id as string;
    const { status, data } = await bookingService.getBookingByUserId(
      parseInt(userId),
    );

    res.status(status).json({
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addBooking = async (req: Request, res: Response) => {
  try {
    const { status, message, data } = await bookingService.addBooking(req.body);
    res.status(status).json({
      status,
      message,
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id as string;
    const user = req.user;
    const { status, message } = await bookingService.cancelBooking(
      bookingId,
      req.body,
      user,
    );
    res.status(status).json({
      status,
      message,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
