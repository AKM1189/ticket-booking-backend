import { User } from "./entity/User";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/authRoutes";
import movieRoutes from "./routes/admin/movieRoutes";
import genreRoutes from "./routes/admin/genreRoutes";
import castRoutes from "./routes/admin/castRoutes";
import theatreRoutes from "./routes/admin/theatreRoutes";
import screenRoutes from "./routes/admin/screenRoutes";
import seatTypeRoute from "./routes/admin/seatTypeRoute";
import scheduleRoutes from "./routes/admin/scheduleRoutes";
import bookingRoutes from "./routes/admin/bookingRoutes";
import userRoutes from "./routes/admin/userRoutes";
import dashboardRoutes from "./routes/admin/reportRoutes";
import profileRoutes from "./routes/admin/profileRoutes";
import notiRoutes from "./routes/admin/notiRoutes";
import userMovieRoutes from "./routes/user/movieRoutes";
import userTheatreRoutes from "./routes/user/theatreRoutes";
import userScheduleRoutes from "./routes/user/scheduleRoutes";
import userReviewRoutes from "./routes/user/reviewRoutes";
import userAboutRoutes from "./routes/user/aboutRoutes";

import { updateMovieStatus } from "./utils/updateMovieStatus";
import { getBookedSeats } from "./utils/getBookedSeats";
import { initializeDB } from "./config/db";

dotenv.config();

/* ---------- Types ---------- */
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

interface TempSeat {
  seatId: string;
  userId: string;
  expiresAt: number;
}

/* ---------- SERVER ---------- */
const startServer = async () => {
  console.log("🔌 Initializing database...");
  await initializeDB();

  const app = express();

  const allowedOrigins =
    process.env.NODE_ENV === "production"
      ? [process.env.PRODUCTION_FRONTEND_URL!]
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

  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  /* ---------- ROUTES ---------- */
  app.use("/api/auth", authRoutes);
  app.use("/api/admin", movieRoutes);
  app.use("/api/admin", genreRoutes);
  app.use("/api/admin", castRoutes);
  app.use("/api/admin", theatreRoutes);
  app.use("/api/admin", screenRoutes);
  app.use("/api/admin", seatTypeRoute);
  app.use("/api/admin", scheduleRoutes);
  app.use("/api/admin", bookingRoutes);
  app.use("/api/admin", dashboardRoutes);
  app.use("/api/admin", profileRoutes);
  app.use("/api/admin", userRoutes);
  app.use("/api", notiRoutes);

  app.use("/api/user", userMovieRoutes);
  app.use("/api/user", userTheatreRoutes);
  app.use("/api/user", userScheduleRoutes);
  app.use("/api/user", userReviewRoutes);
  app.use("/api/user", userAboutRoutes);

  app.get("/", (_, res) => {
    res.json({ status: "API + Socket.IO running" });
  });

  /* ---------- SOCKET ---------- */
  const server = createServer(app);
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  const tempSeats: Record<string, TempSeat[]> = {};

  io.on("connection", (socket) => {
    console.log("🔗 Socket connected:", socket.id);

    socket.on("join schedule", async (scheduleId: string) => {
      socket.join(scheduleId);

      const booked = await getBookedSeats(+scheduleId);
      socket.emit("booked seats", booked);
      socket.emit("update temp seats", tempSeats[scheduleId] || []);
    });

    socket.on("select seat", async ({ scheduleId, seatId, userId }) => {
      const booked = await getBookedSeats(+scheduleId);
      const temp = tempSeats[scheduleId] || [];

      if (booked.includes(seatId) || temp.some((s) => s.seatId === seatId)) {
        return;
      }

      tempSeats[scheduleId] = [
        ...temp,
        { seatId, userId, expiresAt: Date.now() + 5 * 60 * 1000 },
      ];

      io.to(scheduleId).emit("update temp seats", tempSeats[scheduleId]);
    });

    socket.on("deselect seat", ({ scheduleId, seatId, userId }) => {
      tempSeats[scheduleId] =
        tempSeats[scheduleId]?.filter(
          (s) => !(s.seatId === seatId && s.userId === userId),
        ) || [];

      io.to(scheduleId).emit("update temp seats", tempSeats[scheduleId]);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });

  /* ---------- CLEANUP ---------- */
  setInterval(async () => {
    const now = Date.now();

    for (const scheduleId in tempSeats) {
      tempSeats[scheduleId] = tempSeats[scheduleId].filter(
        (s) => s.expiresAt > now,
      );

      const booked = await getBookedSeats(+scheduleId);
      tempSeats[scheduleId] = tempSeats[scheduleId].filter(
        (s) => !booked.includes(s.seatId),
      );
    }
  }, 5000);

  /* ---------- START ---------- */
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    updateMovieStatus();
  });
};

startServer();
