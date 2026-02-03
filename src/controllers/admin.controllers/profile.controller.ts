import { ProfileService } from "../../services/profile.service";
import { Request, Response } from "express";
import { extractFileKeys } from "../../utils/extractImage";

const profileService = new ProfileService();
export const updateProfile = async (req: Request, res: Response) => {

    // const files = req.files as {
    //   [fieldname: string]: Express.Multer.File[];
    // };

    // const profileImg = files["image"]?.[0];
    // if (profileImg) {
    //   profileImgUrl = `${req.protocol}://${req.get("host")}/uploads/${
    //     profileImg.filename
    //   }`;
    // }
    const {singleUrl} = extractFileKeys(req.files as any, {
      single: 'image'
    })

  try {
    const userId = parseInt(req.params.id as string);
    const { status, message, data } = await profileService.updateProfile(
      userId,
      req.body,
      singleUrl,
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
