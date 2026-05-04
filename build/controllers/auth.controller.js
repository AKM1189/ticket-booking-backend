"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.verifyOtp = exports.forgotPasssword = exports.getUserProfile = exports.refreshAccessToken = exports.logout = exports.login = exports.register = void 0;
const auth_service_1 = require("../services/auth.service");
const authService = new auth_service_1.AuthService();
const register = async (req, res) => {
    try {
        const { name, email, password, phoneNo, role } = req.body;
        const { status, message } = await authService.register(name, email, password, phoneNo, role);
        res.status(201).json({ status, message });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { status, message, accessToken, refreshToken, expiresIn } = await authService.login(req.body);
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            maxAge: 3 * 24 * 60 * 60 * 1000,
        }); // 3 days
        res.status(201).json({ status, message, accessToken, expiresIn });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.login = login;
const logout = async (req, res) => {
    try {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
        });
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.logout = logout;
const refreshAccessToken = async (req, res) => {
    try {
        const refresh = req.cookies.refreshToken;
        if (!refresh) {
            res.status(401).json({ message: "No refresh token provided" });
        }
        const { accessToken, expiresIn } = await authService.refreshAccessToken(refresh);
        res.status(200).json({ accessToken, expiresIn });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.refreshAccessToken = refreshAccessToken;
const getUserProfile = async (req, res) => {
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
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getUserProfile = getUserProfile;
const forgotPasssword = async (req, res) => {
    try {
        const { email } = req.body;
        const { message, resetToken } = await authService.forgotPasssword(email);
        res.status(200).json({ message, resetToken });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.forgotPasssword = forgotPasssword;
const verifyOtp = async (req, res) => {
    try {
        const { token, otp } = req.body;
        const { status, message } = await authService.verifyOtp(otp, token);
        res.status(status).json({ message });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.verifyOtp = verifyOtp;
const resetPassword = async (req, res) => {
    try {
        const { password, token } = req.body;
        const { status, message } = await authService.resetPassword(password, token);
        res.status(status).json({ message });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=auth.controller.js.map