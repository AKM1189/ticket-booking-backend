import { ProfileService } from "../services/profile.service";
import { Request, Response } from "express";

const profileService = new ProfileService();
export const updateProfile = async (req: Request, res: Response) => {
  let profileImgUrl: string | null = null; // allow null if no image

  if (req.files) {
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const profileImg = files["image"]?.[0];
    if (profileImg) {
      profileImgUrl = `${req.protocol}://${req.get("host")}/uploads/${
        profileImg.filename
      }`;
    }
  }

  try {
    const userId = parseInt(req.params.id as string);
    const { status, message, data } = await profileService.updateProfile(
      userId,
      req.body,
      profileImgUrl,
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
