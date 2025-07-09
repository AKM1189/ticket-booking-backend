import { AuthService } from "../services/auth.service";
import { Request, Response } from "express";

const authService = new AuthService();

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const { status, message } = await authService.register(
      name,
      email,
      password,
    );
    res.status(201).json({ status, message });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { status, message, accessToken, refreshToken, expiresIn } =
      await authService.login(email, password);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
    }); // 3 days
    res.status(201).json({ status, message, accessToken, expiresIn });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const refresh = req.cookies.refreshToken;
    if (!refresh) {
      res.status(401).json({ message: "No refresh token provided" });
    }
    const { accessToken, expiresIn } = await authService.refreshAccessToken(
      refresh,
    );
    res.status(200).json({ accessToken, expiresIn });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user; // Assuming user is set in a previous middleware
    if (!user) {
      res.status(401).json({ message: "User not authenticated" });
    }
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
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
