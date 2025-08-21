import express from "express";
import { accessAsAdmin } from "../middlewares/auth.middleware";
import {
  addAdmin,
  deactivateUser,
  getUsers,
  updateUser,
} from "../controllers/user.controller";
import { CreateAdminDto } from "../dtos/user.dto";
import { validateDto } from "../middlewares/validateReqBody";

const router = express.Router();

router.get("/users", accessAsAdmin, getUsers);
// router.get("/genres/:id", getGenreById);
router.post("/users", accessAsAdmin, validateDto(CreateAdminDto), addAdmin);
router.put(
  "/users/:id",
  accessAsAdmin,
  validateDto(CreateAdminDto),
  updateUser,
);
router.delete("/users/:id", deactivateUser);

export default router;
