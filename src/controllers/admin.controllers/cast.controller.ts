import { AppDataSource } from "../../data-source";
import { Request, Response } from "express";
import { getQueryParams } from "../../utils/queryParams";
import { Cast } from "../../entity/Cast";
import { CastService } from "../../services/admin.service/cast.service";

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
      data,
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
      data,
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
      data: cast,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addCast = async (req: Request, res: Response) => {
  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };
  const castImg = files["image"]?.[0];
  const castImgUrl = `${req.protocol}://${req.get("host")}/uploads/${
    castImg.filename
  }`;
  try {
    const { status, message, data } = await castService.addCast(
      req.body,
      req.files,
      castImgUrl,
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
  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };
  const castImg = files["image"]?.[0];
  const castImgUrl =
    castImg &&
    `${req.protocol}://${req.get("host")}/uploads/${castImg.filename}`;
  console.log("castImgUrl", files);

  console.log("castImgUrl", castImgUrl);

  try {
    const castId = parseInt(req.params.id as string);
    const { status, message } = await castService.updateCast(
      castId,
      req.body,
      castImgUrl,
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
