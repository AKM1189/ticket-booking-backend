import { ProfileService } from "../../services/profile.service";
import { Request, Response } from "express";

const profileService = new ProfileService();
export const updateProfile = async (req: Request, res: Response) => {
  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };
  const imageFile = files?.["image"]?.[0];

  try {
    const userId = parseInt(req.params.id as string);
    const { status, message, data } = await profileService.updateProfile(
      userId,
      req.body,
      imageFile,
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

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id as string);

    const { status, message } = await profileService.changePassword(
      userId,
      req.body,
    );
    res.status(status).json({
      status,
      message,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
