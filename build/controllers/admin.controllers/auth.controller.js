"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.verifyOtp = exports.forgotPasssword = exports.getAdminProfile = exports.getUserProfile = exports.refreshAccessToken = exports.logout = exports.login = exports.register = void 0;
const auth_service_1 = require("../../services/auth.service");
const AuthType_1 = require("../../types/AuthType");
const data_source_1 = require("../../data-source");
const User_1 = require("../../entity/User");
const user_formatter_1 = require("../../utils/response-formatter/user.formatter");
const cloudinaryUpload_1 = require("../../middlewares/cloudinaryUpload");
const authService = new auth_service_1.AuthService();
const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
const register = async (req, res) => {
    try {
        const { name, email, password, phoneNo, role } = req.body;
        const { status, message } = await authService.register(name, email, password, phoneNo, role);
        res.status(200).json({ status, message });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { status, message, role, accessToken, refreshToken, expiresIn } = await authService.login(req.body);
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
            maxAge: 3 * 24 * 60 * 60 * 1000,
        }); // 3 days
        res.status(200).json({ status, message, role, accessToken, expiresIn });
    }
    catch (err) {
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({ message: err.message });
    }
};
exports.login = login;
const logout = async (req, res) => {
    try {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
        });
        res.status(200).json({ message: "You have logged out successfully" });
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
            res.status(408).json({ message: "No refresh token provided" });
        }
        const { accessToken, expiresIn, newRefreshToken } = await authService.refreshAccessToken(refresh);
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
    }
    catch (err) {
        res.status(401).json({ message: err.message });
    }
};
exports.refreshAccessToken = refreshAccessToken;
const getUserProfile = async (req, res) => {
    try {
        const user = req.user; // Assuming user is set in a previous middleware
        if (!user) {
            res.status(200).json({ role: AuthType_1.Role.guest });
        }
        const currentUser = await userRepo.findOne({
            relations: ["image", "theatre"],
            where: { id: user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phoneNo: true,
                image: true,
                createdAt: true,
                updatedAt: true,
                active: true,
                theatre: true,
            },
        });
        res.status(200).json((0, user_formatter_1.formatUser)(currentUser));
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getUserProfile = getUserProfile;
const getAdminProfile = async (req, res) => {
    try {
        const user = req.user; // Assuming user is set in a previous middleware
        if (!user) {
            res.status(401).json({ message: "User not authenticated" });
        }
        if (user.role === AuthType_1.Role.admin)
            res.status(200).json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                image: { ...user.image, url: (0, cloudinaryUpload_1.getPublicUrl)(user.image.url) },
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                theatre: user.theatre,
            });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getAdminProfile = getAdminProfile;
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