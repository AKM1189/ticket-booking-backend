import { AppDataSource } from "../data-source";
import { Image } from "../entity/Image";
import { User } from "../entity/User";
import bcrypt from "bcrypt";
import { uploadImage } from "../middlewares/cloudinaryUpload";

export class ProfileService {
  private userRepo = AppDataSource.getRepository(User);
  private imageRepo = AppDataSource.getRepository(Image);

  async updateProfile(userId: number, body, imageFile: Express.Multer.File) {
    const { name, email, phoneNo, image } = body;

    const user = await this.userRepo.findOne({
      relations: ["image"],
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    user.name = name;
    user.email = email;
    user.phoneNo = phoneNo;
    if (imageFile) {
      const publicId = await uploadImage(imageFile);
      const profileImage = await this.imageRepo.save({ url: publicId });
      user.image = profileImage;
    }

    await this.userRepo.save(user);

    return {
      status: 200,
      message: "Profile updated successfully!",
      data: user,
    };
  }

  async changePassword(userId: number, body) {
    const { currentPassword, newPassword } = body;

    const user = await this.userRepo.findOneBy({ id: userId });

    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      const error: any = new Error("Invalid Credentials");
      error.statusCode = 401;
      throw error;
    }

    if (user && !user.active) {
      throw new Error(
        "Your account has been deactivated. Please contact support.",
      );
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashPassword;
    await this.userRepo.save(user);

    return {
      status: 200,
      message: "Password changed successfully!",
    };
  }
}
