"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const data_source_1 = require("../data-source");
const User_1 = require("../entity/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const sendEmail_1 = require("../utils/sendEmail");
dotenv_1.default.config();
class AuthService {
    userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
    async register(name, email, password, phoneNo, role) {
        const existingUser = await this.userRepo.findOneBy({
            email,
        });
        if (existingUser) {
            throw new Error("User already exists with this email");
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const newUser = this.userRepo.create({
            name,
            email,
            password: hashedPassword,
            phoneNo,
            role,
            active: true,
            createdAt: new Date(),
            updatedAt: null,
        });
        await this.userRepo.save(newUser);
        return {
            status: 200,
            message: "User registered successfully",
        };
    }
    async login(body) {
        const { email, password } = body;
        const user = await this.userRepo.findOneBy({ email });
        if (!user) {
            throw new Error("User not found");
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            const error = new Error("Invalid Credentials");
            error.statusCode = 401;
            throw error;
        }
        if (user && !user.active) {
            throw new Error("Your account has been deactivated. Please contact support.");
        }
        const accessToken = jsonwebtoken_1.default.sign({ email, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: "15m",
        });
        const refreshToken = jsonwebtoken_1.default.sign({ email, role: user.role }, process.env.REFRESH_SECRET, {
            expiresIn: "3d",
        }); // Generate JWT token here if needed
        // For simplicity, we are not generating a JWT token in this example.
        const decode = jsonwebtoken_1.default.verify(accessToken, process.env.JWT_SECRET);
        const expiresIn = decode?.exp
            ? new Date(decode.exp * 1000).toISOString()
            : null;
        return {
            status: 200,
            message: "Login successful",
            role: user?.role,
            accessToken,
            refreshToken,
            expiresIn,
        };
    }
    async refreshAccessToken(refreshToken) {
        try {
            const decode = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_SECRET);
            const email = decode.email;
            if (!email) {
                throw new Error("Invalid refresh token");
            }
            const user = await this.userRepo.findOneBy({ email });
            if (!user) {
                throw new Error("User not found");
            }
            const accessToken = jsonwebtoken_1.default.sign({ email, role: user.role }, process.env.JWT_SECRET, {
                expiresIn: "15m",
            });
            const newRefreshToken = jsonwebtoken_1.default.sign({ email, role: user.role }, process.env.REFRESH_SECRET, {
                expiresIn: "3d",
            });
            const decodeAccess = jsonwebtoken_1.default.verify(accessToken, process.env.JWT_SECRET);
            const expiresIn = decodeAccess?.exp
                ? new Date(decodeAccess.exp * 1000).toISOString()
                : null;
            return {
                accessToken,
                newRefreshToken,
                expiresIn,
            };
        }
        catch (err) {
            throw new Error("Failed to refresh access token: " + err.message);
        }
    }
    async forgotPasssword(email) {
        if (!email) {
            throw new Error("Email is required");
        }
        const user = await this.userRepo.findOneBy({ email });
        if (!user) {
            throw new Error("User not found");
        }
        if (user && !user.active) {
            throw new Error("Your account has been deactivated. Please contact support.");
        }
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const resetToken = jsonwebtoken_1.default.sign({ email, resetCode }, process.env.JWT_SECRET, {
            expiresIn: "5m",
        });
        console.log("reset Code", resetToken);
        const content = `
    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
      <div style="max-width: 500px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: center;">
        <h2 style="color: #1b81d1;">Your Verification Code</h2>
        <p style="color: #333;">Use the code below to reset your password. It expires in 10 minutes.</p>
        <div style="font-size: 32px; font-weight: bold; margin: 20px 0; color: #1b81d1;">${resetCode}</div>
        <p style="color: #777;">If you didn’t request this, please ignore this email.</p>
        <p style="font-size: 12px; color: #aaa; margin-top: 30px;">© 2025 Movie Palace</p>
      </div>
    </div>
  `;
        (0, sendEmail_1.sendEmail)(email, "Reset Your Password - Movie Palace 🎟️", content);
        return { message: "Reset code sent to your email", resetToken };
    }
    async verifyOtp(otp, token) {
        if (!otp) {
            throw new Error("OTP is required");
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            if (decoded?.resetCode !== otp) {
                return { status: 400, message: "Invalid OTP" };
            }
            return { status: 200, message: "OTP verified successfully" };
        }
        catch (error) {
            return { status: 401, message: "Invalid or expired token" };
        }
    }
    async resetPassword(password, token) {
        if (!password) {
            throw new Error("Password is required");
        }
        else if (!token) {
            throw new Error("Reset Token is required");
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;
        const user = await this.userRepo.findOneBy({ email });
        if (!user) {
            throw new Error("User not found");
        }
        user.password = await bcrypt_1.default.hash(password, 10);
        await this.userRepo.save(user);
        return { status: 200, message: "Password updated successfully" };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map