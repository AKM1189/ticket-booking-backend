import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import movieRoutes from "./routes/movieRoutes";
import genreRoutes from "./routes/genreRoutes";
import cookieParser from "cookie-parser";
dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const createApp = async () => {
  await AppDataSource.initialize();
  const app = express();

  // Update CORS for production
  const allowedOrigins =
    process.env.NODE_ENV === "production"
      ? [process.env.PRODUCTION_FRONTEND_URL]
      : ["http://localhost:5176"];

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  app.use("/api/auth/", authRoutes);
  app.use("/api/admin/", movieRoutes);
  app.use("/api/admin/", genreRoutes);

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
