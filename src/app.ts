import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";

// Import your routes
import authRoutes from "./routes/authRoutes";
import movieRoutes from "./routes/movieRoutes";
import genreRoutes from "./routes/genreRoutes";
import castRoutes from "./routes/castRoutes";
import theatreRoutes from "./routes/theatreRoutes";
import screenRoutes from "./routes/screenRoutes";
import seatTypeRoute from "./routes/seatTypeRoute";
import scheduleRoutes from "./routes/scheduleRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import userRoutes from "./routes/userRoutes";
import dashboardRoutes from "./routes/reportRoutes";
import profileRoutes from "./routes/profileRoutes";
import notiRoutes from "./routes/notiRoutes";

import { updateMovieStatus } from "./utils/updateMovieStatus";
import { getBookedSeats } from "./utils/getBookedSeats";
import { initSocket } from "./socket";

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const createApp = async () => {
  console.log("Initializing DB...");
  await AppDataSource.initialize();
  console.log("DB initialized!");

  const app = express();

  // Middlewares
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

  // Static files
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  // API routes
  const authUrl = "/api/auth/";
  const adminUrl = "/api/admin/";

  app.use(authUrl, authRoutes);
  app.use(adminUrl, movieRoutes);
  app.use(adminUrl, genreRoutes);
  app.use(adminUrl, castRoutes);
  app.use(adminUrl, theatreRoutes);
  app.use(adminUrl, screenRoutes);
  app.use(adminUrl, seatTypeRoute);
  app.use(adminUrl, scheduleRoutes);
  app.use(adminUrl, bookingRoutes);
  app.use(adminUrl, dashboardRoutes);
  app.use(adminUrl, profileRoutes);
  app.use(adminUrl, userRoutes);
  app.use(adminUrl, notiRoutes);

  return app;
};

interface TempSeat {
  seatId: string;
  userId: string;
  expiresAt: number; // timestamp when the 2 minutes expire
}

// Main server startup
const startServer = async () => {
  const app = await createApp();

  // Create HTTP server
  const server = createServer(app);

  // Attach Socket.IO
  const io = initSocket(server);

  const tempSeats: Record<string, TempSeat[]> = {};

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join schedule", async (scheduleId: string) => {
      socket.join(scheduleId);
      console.log("joined room", scheduleId);
      // Send initial seat status
      const booked = await getBookedSeats(parseInt(scheduleId));

      // const temp = tempSeats[scheduleId]?.map((s) => s.seatId) || [];
      console.log("booked", booked, "temp", tempSeats[scheduleId]);

      io.to(scheduleId).emit("update temp seats", tempSeats[scheduleId]);
      socket.emit("booked seats", booked);
    });

    // Select seat
    socket.on("select seat", async ({ scheduleId, seatId, userId }) => {
      const booked = await getBookedSeats(parseInt(scheduleId));
      const temp = tempSeats[scheduleId] || [];

      if (booked.includes(seatId) || temp.some((s) => s.seatId === seatId)) {
        socket.emit("booked seats", booked);
        return;
      }

      tempSeats[scheduleId] = [
        ...temp,
        { seatId, userId, expiresAt: Date.now() + 1000 * 30 },
      ];

      console.log("temp seats", tempSeats[scheduleId]);
      io.to(scheduleId).emit("update temp seats", tempSeats[scheduleId]);
    });

    // Deselect seat
    socket.on("deselect seat", ({ scheduleId, seatId, userId }) => {
      tempSeats[scheduleId] = (tempSeats[scheduleId] || []).filter(
        (s) => !(s.seatId === seatId && s.userId === userId),
      );
      io.to(scheduleId).emit("update temp seats", tempSeats[scheduleId]);
    });

    // reset temp seat
    socket.on("reset temp seats", ({ scheduleId, userId }) => {
      tempSeats[scheduleId] = (tempSeats[scheduleId] || []).filter(
        (s) => !(s.userId === userId),
      );

      io.to(scheduleId).emit("update temp seats", tempSeats[scheduleId]);
    });

    socket.on("disconnect", () => {
      // socket.emit("update temp seats", []);

      io.emit("update temp seats", tempSeats);
      console.log("User disconnected");
    });
  });

  setInterval(async () => {
    const now = Date.now();

    for (const scheduleId in tempSeats) {
      const before = tempSeats[scheduleId].length;

      // filter out expired seats
      tempSeats[scheduleId] = tempSeats[scheduleId].filter(
        (s) => s.expiresAt > now,
      );
      // 🔸 2. Remove seats that got booked in DB
      const booked = await getBookedSeats(parseInt(scheduleId));
      tempSeats[scheduleId] = tempSeats[scheduleId].filter(
        (s) => !booked.includes(s.seatId),
      );

      // 🔸 3. Broadcast if list changed
      if (tempSeats[scheduleId].length !== before) {
        if (io.sockets.adapter.rooms.has(scheduleId)) {
          console.log("temp seats updated", scheduleId, tempSeats[scheduleId]);
          io.to(scheduleId).emit(
            "update temp seats",
            tempSeats[scheduleId] || [],
          );
          io.to(scheduleId).emit("booked seats", booked);
        }
      }
    }
  }, 5000);

  // Start server

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    updateMovieStatus();
  });
};

if (process.env.NODE_ENV !== "production") {
  startServer();
}
