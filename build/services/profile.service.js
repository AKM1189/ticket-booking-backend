"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const data_source_1 = require("../data-source");
const Image_1 = require("../entity/Image");
const User_1 = require("../entity/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const cloudinaryUpload_1 = require("../middlewares/cloudinaryUpload");
class ProfileService {
    userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
    imageRepo = data_source_1.AppDataSource.getRepository(Image_1.Image);
    async updateProfile(userId, body, imageFile) {
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
            const publicId = await (0, cloudinaryUpload_1.uploadImage)(imageFile);
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
    async changePassword(userId, body) {
        const { currentPassword, newPassword } = body;
        const user = await this.userRepo.findOneBy({ id: userId });
        if (!user) {
            throw new Error("User not found");
        }
        const isPasswordValid = await bcrypt_1.default.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            const error = new Error("Invalid Credentials");
            error.statusCode = 401;
            throw error;
        }
        if (user && !user.active) {
            throw new Error("Your account has been deactivated. Please contact support.");
        }
        const hashPassword = await bcrypt_1.default.hash(newPassword, 10);
        user.password = hashPassword;
        await this.userRepo.save(user);
        return {
            status: 200,
            message: "Password changed successfully!",
        };
    }
}
exports.ProfileService = ProfileService;
//# sourceMappingURL=profile.service.js.map