import express from "express";
import { getAboutInfo } from "../../controllers/user.controllers/about.controller";
const router = express.Router();

router.get("/about/info", getAboutInfo);

export default router;
