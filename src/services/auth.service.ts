import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

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
      throw new Error("Invalid password");
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
}
