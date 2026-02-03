import { AppDataSource } from "../../data-source";
import { GenreService } from "../../services/admin.service/genre.service";
import { Request, Response } from "express";
import { getQueryParams } from "../../utils/queryParams";
import { Genre } from "../../entity/Genre";
import { UserService } from "../../services/admin.service/user.service";
import { Role } from "../../types/AuthType";
import {
  formatUser,
  formatUsers,
} from "../../utils/response-formatter/user.formatter";

const userService = new UserService();

export const getUsers = async (req: Request, res: Response) => {
  try {
    const role = req.query.role as Role;
    const search = req.query.search as string;
    const { page, limit, sortBy, sortOrder } = getQueryParams(req, 1, 10, "id");
    const { status, data, pagination } = await userService.getUsers(
      search,
      role,
      page,
      limit,
      sortBy,
      sortOrder,
    );

    res.status(status).json({
      data: formatUsers(data),
      pagination,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addAdmin = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { status, message, data } = await userService.addAdmin(
      req.body,
      user,
    );
    res.status(status).json({
      status,
      message,
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id as string);
    const user = req.user;
    const { status, message, data } = await userService.updateUser(
      userId,
      req.body,
      user,
    );
    res.status(status).json({
      status,
      message,
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deactivateUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id as string);
    const user = req.user;
    const { status, message } = await userService.deactivateUser(userId, user);
    res.status(status).json({
      status,
      message,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
