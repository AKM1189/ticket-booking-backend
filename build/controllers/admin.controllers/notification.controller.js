"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readAllNoti = exports.readNoti = exports.getNotifications = void 0;
const queryParams_1 = require("../../utils/queryParams");
const notification_service_1 = require("../../services/admin.service/notification.service");
const notiService = new notification_service_1.NotificationService();
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const type = req.params.type;
        const { page, limit } = (0, queryParams_1.getQueryParams)(req, 1, 10, "id");
        const { status, data, pagination } = await notiService.getNotifications(page, limit, "createdAt", "DESC", userId, type);
        res.status(status).json({
            data,
            pagination,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getNotifications = getNotifications;
const readNoti = async (req, res) => {
    try {
        const notiId = req.params.id;
        const userId = req.user.id;
        const { status, message } = await notiService.readNoti(notiId, userId);
        res.status(status).json({
            status,
            message,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.readNoti = readNoti;
const readAllNoti = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, message } = await notiService.readAllNoti(userId);
        res.status(status).json({
            status,
            message,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.readAllNoti = readAllNoti;
//# sourceMappingURL=notification.controller.js.map