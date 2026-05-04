"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const data_source_1 = require("../../data-source");
const Notification_1 = require("../../entity/Notification");
const UserNotification_1 = require("../../entity/UserNotification");
class NotificationService {
    notiRepo = data_source_1.AppDataSource.getRepository(Notification_1.Notification);
    userNotiRepo = data_source_1.AppDataSource.getRepository(UserNotification_1.UserNotification);
    async getNotifications(page, limit, sortBy, sortOrder, userId, type) {
        const [notifications, total] = await this.notiRepo.findAndCount({
            relations: ["users", "users.user"],
            order: {
                [sortBy]: sortOrder,
            },
            skip: (page - 1) * limit,
            take: limit,
            where: {
                users: { user: { id: userId }, read: type === "read" ? true : false },
            },
        });
        const formattedNoti = notifications?.map((noti) => {
            const { id, type, title, message, createdAt, users } = noti;
            if (users[0]?.user?.id === userId) {
                return {
                    id,
                    type,
                    title,
                    message,
                    createdAt,
                    userId: users[0]?.user?.id,
                    read: users[0]?.read,
                    readAt: users[0]?.readAt,
                };
            }
        });
        return {
            status: 200,
            data: formattedNoti,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async readNoti(notiId, userId) {
        const noti = await this.notiRepo.findOne({
            where: { id: parseInt(notiId) },
        });
        if (!noti) {
            throw new Error("Notification not found!");
        }
        const userNoti = await this.userNotiRepo.findOne({
            relations: ["notification", "user"],
            where: {
                notification: { id: parseInt(notiId) },
                user: { id: userId },
            },
        });
        if (!userNoti) {
            throw new Error("Notification for this user not found!");
        }
        userNoti.read = true;
        await this.userNotiRepo.save(userNoti);
        return {
            status: 200,
            message: "Notification read successfully",
        };
    }
    async readAllNoti(userId) {
        const userNoti = await this.userNotiRepo.find({
            relations: ["notification", "user"],
            where: {
                user: { id: userId },
                read: false,
            },
        });
        if (userNoti.length === 0) {
            throw new Error("Notification for this user not found!");
        }
        await this.userNotiRepo.update({ user: { id: userId }, read: false }, { read: true });
        return {
            status: 200,
            message: "Read all notifications successfully",
        };
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.service.js.map