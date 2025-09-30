import express from "express";
import { getShowingTheatres } from "../../controllers/user.controllers/theatre.controller";
const router = express.Router();

router.get("/theatres/showing", getShowingTheatres);

export default router;
