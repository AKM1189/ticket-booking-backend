import express from "express";
import { validateDto } from "../middlewares/validateReqBody";
import { CreateGenreDto } from "../dtos/genre.dto";
import { accessAsAdmin, protect } from "../middlewares/auth.middleware";
import {
  addScreen,
  deleteScreen,
  getScreen,
  getScreenByShow,
  getScreenByTheatre,
  updateScreen,
} from "../controllers/screen.controller";
import { CreateScreenDto } from "../dtos/screen.dto";

const router = express.Router();

router.get("/screens", getScreen);
router.get("/screens/all", getScreenByTheatre);

router.get("/screens/showing", getScreenByShow);
// router.get("/genres/:id", getGenreById);
router.post("/screens", accessAsAdmin, validateDto(CreateScreenDto), addScreen);
router.put(
  "/screens/:id",
  accessAsAdmin,
  validateDto(CreateScreenDto),
  updateScreen,
);
router.delete("/screens/:id", accessAsAdmin, deleteScreen);

export default router;
