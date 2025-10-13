import { Request, Response } from "express";
import { ReviewService } from "../../services/admin.service/review.service";

const reviewService = new ReviewService();

export const addReview = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { status, message, data } = await reviewService.addReview(
      req.body,
      user.id,
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

export const updateReview = async (req: Request, res: Response) => {
  try {
    const genreId = parseInt(req.params.id as string);
    const { status, message, data } = await reviewService.updateReview(
      genreId,
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

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { status, message } = await reviewService.deleteReview(id);
    res.status(status).json({
      status,
      message,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
