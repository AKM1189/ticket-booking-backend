import { AppDataSource } from "../data-source";
import { GenreService } from "../services/genre.service";
import { Request, Response } from "express";
import { getQueryParams } from "../utils/queryParams";
import { Genre } from "../entity/Genre";
import { BookingService } from "../services/booking.service";

const bookingService = new BookingService();

export const getBookings = async (req: Request, res: Response) => {
  try {
    const { page, limit, sortBy, sortOrder } = getQueryParams(req, 1, 10, "id");
    const { status, data, pagination } = await bookingService.getBookings(
      page,
      limit,
      sortBy,
      sortOrder,
    );

    res.status(status).json({
      data,
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
    const { status, message } = await bookingService.cancelBooking(bookingId);
    res.status(status).json({
      status,
      message,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
