import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { sentResetEmail } from "../utils/sendEmail";

dotenv.config();

export class AuthService {
  private userRepo = AppDataSource.getRepository(User);

  async register(name: string, email: string, password: string) {
    const existingUser = await this.userRepo.findOneBy({ email });

    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepo.create({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: null,
    });

    await this.userRepo.save(newUser);

    return {
      status: 200,
      message: "User registered successfully",
    };
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOneBy({ email });

    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid Credentials");
    }

    const accessToken = jwt.sign({ email }, process.env.ACCESS_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ email }, process.env.REFRESH_SECRET, {
      expiresIn: "3d",
    }); // Generate JWT token here if needed
    // For simplicity, we are not generating a JWT token in this example.

    const decode = jwt.verify(
      accessToken,
      process.env.ACCESS_SECRET,
    ) as jwt.JwtPayload;
    const expiresIn = decode?.exp
      ? new Date(decode.exp * 1000).toISOString()
      : null;

    return {
      status: 200,
      message: "Login successful",
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const decode = jwt.verify(
        refreshToken,
        process.env.REFRESH_SECRET,
      ) as jwt.JwtPayload;
      const email = decode.email;
      if (!email) {
        throw new Error("Invalid refresh token");
      }
      const user = await this.userRepo.findOneBy({ email });
      if (!user) {
        throw new Error("User not found");
      }
      const accessToken = jwt.sign({ email }, process.env.ACCESS_SECRET, {
        expiresIn: "15m",
      });
      const decodeAccess = jwt.verify(
        accessToken,
        process.env.ACCESS_SECRET,
      ) as jwt.JwtPayload;
      const expiresIn = decodeAccess?.exp
        ? new Date(decodeAccess.exp * 1000).toISOString()
        : null;
      return {
        accessToken,
        expiresIn,
      };
    } catch (err) {
      throw new Error("Failed to refresh access token: " + err.message);
    }
  }

  async forgotPasssword(email: string) {
    if (!email) {
      throw new Error("Email is required");
    }
    const user = await this.userRepo.findOneBy({ email });
    if (!user) {
      throw new Error("User not found");
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    const resetToken = jwt.sign({ email, resetCode }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });

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

    sentResetEmail(email, "Reset Your Password - Movie Palace 🎟️", content);
    return { message: "Reset code sent to your email", resetToken };
  }

  async verifyOtp(otp: number, token: string) {
    if (!otp) {
      throw new Error("OTP is required");
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        resetCode?: number;
        [key: string]: any;
      };

      if (decoded?.resetCode !== otp) {
        return { status: 400, message: "Invalid OTP" };
      }

      return { status: 200, message: "OTP verified successfully" };
    } catch (error) {
      return { status: 401, message: "Invalid or expired token" };
    }
  }

  async resetPassword(password: string, token: string) {
    if (!password) {
      throw new Error("Password is required");
    } else if (!token) {
      throw new Error("Reset Token is required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      resetCode?: number;
      [key: string]: any;
    };
    const email = decoded.email;
    const user = await this.userRepo.findOneBy({ email });
    if (!user) {
      throw new Error("User not found");
    }
    user.password = await bcrypt.hash(password, 10);
    await this.userRepo.save(user);

    return { status: 200, message: "Password updated successfully" };
  }
}
