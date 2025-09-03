import { AuthService } from "../services/auth.service";
import { Request, Response } from "express";
import { Role } from "../types/AuthType";

const authService = new AuthService();

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phoneNo, role } = req.body;
    const { status, message } = await authService.register(
      name,
      email,
      password,
      phoneNo,
      role,
    );
    res.status(200).json({ status, message });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { status, message, role, accessToken, refreshToken, expiresIn } =
      await authService.login(req.body);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    }); // 3 days
    res.status(200).json({ status, message, role, accessToken, expiresIn });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ message: err.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });
    res.status(200).json({ message: "You have logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const refresh = req.cookies.refreshToken;
    if (!refresh) {
      res.status(408).json({ message: "No refresh token provided" });
    }
    const { accessToken, expiresIn, newRefreshToken } =
      await authService.refreshAccessToken(refresh);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    }); // 3 days
    res.status(200).json({ accessToken, expiresIn });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user; // Assuming user is set in a previous middleware
    if (!user) {
      res.status(200).json({ role: Role.guest });
    }
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAdminProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user; // Assuming user is set in a previous middleware
    if (!user) {
      res.status(401).json({ message: "User not authenticated" });
    }

    if (user.role === Role.admin)
      res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const forgotPasssword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const { message, resetToken } = await authService.forgotPasssword(email);
    res.status(200).json({ message, resetToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { token, otp } = req.body;
    const { status, message } = await authService.verifyOtp(otp, token);
    res.status(status).json({ message });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { password, token } = req.body;
    const { status, message } = await authService.resetPassword(
      password,
      token,
    );
    res.status(status).json({ message });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
