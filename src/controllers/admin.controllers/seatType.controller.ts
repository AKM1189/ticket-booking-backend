import { Request, Response } from "express";
import { getQueryParams } from "../../utils/queryParams";
import { SeatTypeService } from "../../services/admin.service/seatType.service";

const seatTypeService = new SeatTypeService();

export const getSeatTypes = async (req: Request, res: Response) => {
  try {
    const { page, limit, sortBy, sortOrder } = getQueryParams(req, 1, 10, "id");
    const { status, data, pagination } = await seatTypeService.getSeatTypes(
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

export const addSeatType = async (req: Request, res: Response) => {
  try {
    const { status, message, data } = await seatTypeService.addSeatType(
      req.body,
    );
    res.status(status).json({
      status,
      message,
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateSeatType = async (req: Request, res: Response) => {
  try {
    const typeId = parseInt(req.params.id as string);
    const { status, message, data } = await seatTypeService.updateSeatType(
      typeId,
      req.body,
    );
    res.status(status).json({
      status,
      message,
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteSeatType = async (req: Request, res: Response) => {
  try {
    const typeId = parseInt(req.params.id as string);
    const { status, message } = await seatTypeService.deleteSeatType(typeId);
    res.status(status).json({
      status,
      message,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
