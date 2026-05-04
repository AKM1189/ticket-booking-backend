"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.updateReview = exports.addReview = void 0;
const review_service_1 = require("../../services/admin.service/review.service");
const reviewService = new review_service_1.ReviewService();
const addReview = async (req, res) => {
    try {
        const user = req.user;
        const { status, message, data } = await reviewService.addReview(req.body, user.id);
        res.status(status).json({
            status,
            message,
            data,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.addReview = addReview;
const updateReview = async (req, res) => {
    try {
        const genreId = parseInt(req.params.id);
        const { status, message, data } = await reviewService.updateReview(genreId, req.body);
        res.status(status).json({
            status,
            message,
            data,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.updateReview = updateReview;
const deleteReview = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { status, message } = await reviewService.deleteReview(id);
        res.status(status).json({
            status,
            message,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.deleteReview = deleteReview;
//# sourceMappingURL=review.controller.js.map