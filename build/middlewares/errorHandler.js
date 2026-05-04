"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    const statusCode = err.status || 500;
    const message = err.message || "Internal Server Error";
    res.status(statusCode).json({
        status: "error",
        statusCode,
        message,
    });
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res, next) => {
    const error = new Error("Not Found");
    error.status = 404;
    next(error);
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=errorHandler.js.map