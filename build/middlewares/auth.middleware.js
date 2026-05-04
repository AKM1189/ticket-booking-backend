"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accessAsAdmin = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const data_source_1 = require("../data-source");
const User_1 = require("../entity/User");
const AuthType_1 = require("../types/AuthType");
dotenv_1.default.config();
// Extend Express Request interface to include 'user'
const protect = async (req, res, next) => {
    const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        try {
            const token = req.headers.authorization.split(" ")[1];
            if (!process.env.JWT_SECRET) {
                throw "JWT_SECRET) { is not defined in the environment variables";
            }
            const decode = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const email = decode?.email;
            if (!email) {
                throw new Error("Invalid access token");
            }
            const user = await userRepo.findOneBy({ email });
            if (!user) {
                res.status(401).json({
                    message: "User not found",
                });
            }
            req.user = user; // Attach user to the request object
            next();
        }
        catch (err) {
            if ((err.name = "TokenExpiredError")) {
                res.status(408).json({
                    message: "Token expired. Please log in again",
                });
            }
            else {
                res.status(401).json({
                    message: "Not Authorized",
                });
            }
        }
    }
    else {
        res.status(401).json({
            message: "Not Authorized, No Access Token",
        });
    }
};
exports.protect = protect;
const accessAsAdmin = async (req, res, next) => {
    const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        try {
            const token = req.headers.authorization.split(" ")[1];
            if (!process.env.JWT_SECRET) {
                throw "JWT_SECRET) { is not defined in the environment variables";
            }
            const decode = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const email = decode?.email;
            const role = decode?.role;
            if (!email) {
                throw new Error("Invalid access token");
            }
            if (role !== AuthType_1.Role.admin && role !== AuthType_1.Role.staff) {
                throw new Error("You don't have access to this route.");
            }
            const adminUser = await userRepo.findOneBy({ email, role: AuthType_1.Role.admin });
            const staffUser = await userRepo.findOne({
                relations: ["theatre"],
                where: { email, role: AuthType_1.Role.staff },
            });
            if (!adminUser && !staffUser) {
                res.status(401).json({
                    message: "User not found",
                });
            }
            req.user = adminUser ? adminUser : staffUser; // Attach user to the request object
            next();
        }
        catch (err) {
            if ((err.name = "TokenExpiredError")) {
                res.status(408).json({
                    message: "Token expired. Please log in again",
                });
            }
            else
                res.status(401).json({
                    error: err,
                    message: err?.message,
                });
        }
    }
    else {
        res.status(401).json({
            message: "Not Authorized, No Access Token",
        });
    }
};
exports.accessAsAdmin = accessAsAdmin;
//# sourceMappingURL=auth.middleware.js.map