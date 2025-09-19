import { Request, Response, NextFunction as Next } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Role } from "../types/AuthType";

dotenv.config();
// Extend Express Request interface to include 'user'

export const protect = async (req: Request, res: Response, next: Next) => {
  const userRepo = AppDataSource.getRepository(User);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];

      if (!process.env.JWT_SECRET) {
        throw "JWT_SECRET) { is not defined in the environment variables";
      }

      const decode = jwt.verify(
        token,
        process.env.JWT_SECRET,
      ) as jwt.JwtPayload;
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
    } catch (err) {
      if ((err.name = "TokenExpiredError")) {
        res.status(408).json({
          message: "Token expired. Please log in again",
        });
      } else {
        res.status(401).json({
          message: "Not Authorized",
        });
      }
    }
  } else {
    res.status(401).json({
      message: "Not Authorized, No Access Token",
    });
  }
};

export const accessAsAdmin = async (
  req: Request,
  res: Response,
  next: Next,
) => {
  const userRepo = AppDataSource.getRepository(User);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];

      if (!process.env.JWT_SECRET) {
        throw "JWT_SECRET) { is not defined in the environment variables";
      }

      const decode = jwt.verify(
        token,
        process.env.JWT_SECRET,
      ) as jwt.JwtPayload;
      const email = decode?.email;
      const role = decode?.role;
      if (!email) {
        throw new Error("Invalid access token");
      }
      if (role !== Role.admin && role !== Role.staff) {
        throw new Error("You don't have access to this route.");
      }
      const adminUser = await userRepo.findOneBy({ email, role: Role.admin });
      const staffUser = await userRepo.findOne({
        relations: ["theatre"],
        where: { email, role: Role.staff },
      });
      if (!adminUser && !staffUser) {
        res.status(401).json({
          message: "User not found",
        });
      }
      req.user = adminUser ? adminUser : staffUser; // Attach user to the request object
      next();
    } catch (err) {
      console.log("error admin", err);
      if ((err.name = "TokenExpiredError")) {
        res.status(408).json({
          message: "Token expired. Please log in again",
        });
      } else
        res.status(401).json({
          error: err,
          message: err?.message,
        });
    }
  } else {
    res.status(401).json({
      message: "Not Authorized, No Access Token",
    });
  }
};
