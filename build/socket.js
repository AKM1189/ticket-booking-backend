"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
// socket.ts
const socket_io_1 = require("socket.io");
let io;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.NODE_ENV === "production"
                ? [process.env.PRODUCTION_FRONTEND_URL]
                : ["http://localhost:5178"],
            credentials: true,
        },
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized! Call initSocket first.");
    }
    return io;
};
exports.getIO = getIO;
//# sourceMappingURL=socket.js.map