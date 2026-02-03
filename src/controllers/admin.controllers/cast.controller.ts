import { AppDataSource } from "../../data-source";
import { Request, Response } from "express";
import { getQueryParams } from "../../utils/queryParams";
import { Cast } from "../../entity/Cast";
import { CastService } from "../../services/admin.service/cast.service";
import { FilesType } from "../../types/ImageType";
import {
  formatCast,
  formatCasts,
} from "../../utils/response-formatter/cast.formatter";

const castService = new CastService();

export const getCast = async (req: Request, res: Response) => {
  try {
    const { page, limit, sortBy, sortOrder, search } = getQueryParams(
      req,
      1,
      10,
      "id",
    );
    const { status, data, pagination } = await castService.getCast(
      page,
      limit,
      sortBy,
      sortOrder,
      search,
    );

    res.status(status).json({
      data: formatCasts(data),
      pagination,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllCast = async (req: Request, res: Response) => {
  try {
    const { status, data } = await castService.getAllCast();

    res.status(status).json({
      data: formatCasts(data),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCastById = async (req: Request, res: Response) => {
  try {
    const castRepo = AppDataSource.getRepository(Cast);
    const id = parseInt(req.params.id as string);
    const cast = await castRepo.findOneBy({ id });
    if (!cast) {
      res.status(404).json({ message: "Cast not found" });
    }
    res.status(200).json({
      data: formatCast(cast),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addCast = async (req: Request, res: Response) => {
  const files = req.files as FilesType;
  try {
    const { status, message, data } = await castService.addCast(
      req.body,
      files,
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

export const updateCast = async (req: Request, res: Response) => {
  const files = req.files as FilesType;

  try {
    const castId = parseInt(req.params.id as string);
    const { status, message } = await castService.updateCast(
      castId,
      req.body,
      files,
    );
    res.status(status).json({
      status,
      message,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCast = async (req: Request, res: Response) => {
  try {
    const castId = parseInt(req.params.id as string);
    const { status, message } = await castService.deleteCast(castId);
    res.status(status).json({
      status,
      message,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
