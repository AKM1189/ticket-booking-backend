"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const http_1 = require("http");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const movieRoutes_1 = __importDefault(require("./routes/admin/movieRoutes"));
const genreRoutes_1 = __importDefault(require("./routes/admin/genreRoutes"));
const castRoutes_1 = __importDefault(require("./routes/admin/castRoutes"));
const theatreRoutes_1 = __importDefault(require("./routes/admin/theatreRoutes"));
const screenRoutes_1 = __importDefault(require("./routes/admin/screenRoutes"));
const seatTypeRoute_1 = __importDefault(require("./routes/admin/seatTypeRoute"));
const scheduleRoutes_1 = __importDefault(require("./routes/admin/scheduleRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/admin/bookingRoutes"));
const userRoutes_1 = __importDefault(require("./routes/admin/userRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/admin/reportRoutes"));
const profileRoutes_1 = __importDefault(require("./routes/admin/profileRoutes"));
const notiRoutes_1 = __importDefault(require("./routes/admin/notiRoutes"));
const movieRoutes_2 = __importDefault(require("./routes/user/movieRoutes"));
const theatreRoutes_2 = __importDefault(require("./routes/user/theatreRoutes"));
const scheduleRoutes_2 = __importDefault(require("./routes/user/scheduleRoutes"));
const reviewRoutes_1 = __importDefault(require("./routes/user/reviewRoutes"));
const aboutRoutes_1 = __importDefault(require("./routes/user/aboutRoutes"));
const updateMovieStatus_1 = require("./utils/updateMovieStatus");
const getBookedSeats_1 = require("./utils/getBookedSeats");
const db_1 = require("./config/db");
const socket_1 = require("./socket");
dotenv_1.default.config();
/* ---------- SERVER ---------- */
const startServer = async () => {
    console.log("🔌 Initializing database...");
    await (0, db_1.initializeDB)();
    const app = (0, express_1.default)();
    const allowedOrigins = process.env.NODE_ENV === "production"
        ? [process.env.PRODUCTION_FRONTEND_URL]
        : ["http://localhost:5178"];
    app.use((0, cors_1.default)({
        origin: allowedOrigins,
        credentials: true,
    }));
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: false }));
    app.use((0, cookie_parser_1.default)());
    app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "uploads")));
    /* ---------- ROUTES ---------- */
    app.use("/api/auth", authRoutes_1.default);
    app.use("/api/admin", movieRoutes_1.default);
    app.use("/api/admin", genreRoutes_1.default);
    app.use("/api/admin", castRoutes_1.default);
    app.use("/api/admin", theatreRoutes_1.default);
    app.use("/api/admin", screenRoutes_1.default);
    app.use("/api/admin", seatTypeRoute_1.default);
    app.use("/api/admin", scheduleRoutes_1.default);
    app.use("/api/admin", bookingRoutes_1.default);
    app.use("/api/admin", reportRoutes_1.default);
    app.use("/api/admin", profileRoutes_1.default);
    app.use("/api/admin", userRoutes_1.default);
    app.use("/api", notiRoutes_1.default);
    app.use("/api/user", movieRoutes_2.default);
    app.use("/api/user", theatreRoutes_2.default);
    app.use("/api/user", scheduleRoutes_2.default);
    app.use("/api/user", reviewRoutes_1.default);
    app.use("/api/user", aboutRoutes_1.default);
    app.get("/", (_, res) => {
        res.json({ status: "API + Socket.IO running" });
    });
    /* ---------- SOCKET ---------- */
    const server = (0, http_1.createServer)(app);
    const io = (0, socket_1.initSocket)(server);
    const tempSeats = {};
    io.on("connection", (socket) => {
        console.log("🔗 Socket connected:", socket.id);
        socket.on("join schedule", async (scheduleId) => {
            socket.join(scheduleId);
            const booked = await (0, getBookedSeats_1.getBookedSeats)(+scheduleId);
            socket.emit("booked seats", booked);
            socket.emit("update temp seats", tempSeats[scheduleId] || []);
        });
        socket.on("select seat", async ({ scheduleId, seatId, userId }) => {
            const booked = await (0, getBookedSeats_1.getBookedSeats)(+scheduleId);
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
                tempSeats[scheduleId]?.filter((s) => !(s.seatId === seatId && s.userId === userId)) || [];
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
            tempSeats[scheduleId] = tempSeats[scheduleId].filter((s) => s.expiresAt > now);
            const booked = await (0, getBookedSeats_1.getBookedSeats)(+scheduleId);
            tempSeats[scheduleId] = tempSeats[scheduleId].filter((s) => !booked.includes(s.seatId));
        }
    }, 5000);
    /* ---------- START ---------- */
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        (0, updateMovieStatus_1.updateMovieStatus)();
    });
};
startServer();
//# sourceMappingURL=app.js.map