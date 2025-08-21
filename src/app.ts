import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import movieRoutes from "./routes/movieRoutes";
import genreRoutes from "./routes/genreRoutes";
import castRoutes from "./routes/castRoutes";
import theatreRoutes from "./routes/theatreRoutes";
import screenRoutes from "./routes/screenRoutes";
import seatTypeRoute from "./routes/seatTypeRoute";
import userRoutes from "./routes/userRoutes";
import cookieParser from "cookie-parser";
import path from "path";
dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
//////////////////////////
export const createApp = async () => {
  console.log("Initializing DB...");
  await AppDataSource.initialize();
  console.log("DB initialized!");
  const app = express();

  // Update CORS for production
  const allowedOrigins =
    process.env.NODE_ENV === "production"
      ? [process.env.PRODUCTION_FRONTEND_URL]
      : ["http://localhost:5178"];

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  // Static file serving
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  app.use("/api/auth/", authRoutes);
  app.use("/api/admin/", movieRoutes);
  app.use("/api/admin/", genreRoutes);
  app.use("/api/admin/", castRoutes);
  app.use("/api/admin/", theatreRoutes);
  app.use("/api/admin/", screenRoutes);
  app.use("/api/admin/", seatTypeRoute);
  app.use("/api/admin/", userRoutes);

  return app;
};
const localServer = async () => {
  const app = await createApp();
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT} `);
  });
};
if (process.env.NODE_ENV !== "production") {
  localServer();
}
