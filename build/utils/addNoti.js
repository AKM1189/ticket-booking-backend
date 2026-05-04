"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addUserNotification = exports.addNotification = void 0;
const constants_1 = require("../constants");
const data_source_1 = require("../data-source");
const Notification_1 = require("../entity/Notification");
const User_1 = require("../entity/User");
const UserNotification_1 = require("../entity/UserNotification");
const socket_1 = require("../socket");
const AuthType_1 = require("../types/AuthType");
const addNotification = async (type, title, message, userId, theatreId) => {
    const notiRepo = data_source_1.AppDataSource.getRepository(Notification_1.Notification);
    const userNotiRepo = data_source_1.AppDataSource.getRepository(UserNotification_1.UserNotification);
    const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
    const users = await userRepo.find({
        relations: ["theatre"],
        where: [
            { role: AuthType_1.Role.admin },
            {
                ...(theatreId ? { role: AuthType_1.Role.staff, theatre: { id: theatreId } } : {}),
            },
        ],
    });
    const newNoti = notiRepo.create({
        type,
        title,
        message,
        createdAt: new Date(),
    });
    const notification = await notiRepo.save(newNoti);
    const admins = users.filter((user) => user.role === AuthType_1.Role.admin && user.id !== userId);
    const staffs = users.filter((user) => user.role === AuthType_1.Role.staff && user.id !== userId);
    if (staffs?.length > 0 && Object.values(constants_1.STAFF_NOTI_TYPE).includes(type)) {
        staffs.map(async (user) => {
            const newUserNoti = userNotiRepo.create({
                user,
                notification,
                read: false,
            });
            await userNotiRepo.save(newUserNoti);
        });
    }
    if (admins?.length > 0) {
        admins.map(async (user) => {
            const newUserNoti = userNotiRepo.create({
                user,
                notification,
                read: false,
            });
            await userNotiRepo.save(newUserNoti);
        });
    }
    const io = (0, socket_1.getIO)();
    io.emit("new notification", { message: "new notification" });
};
exports.addNotification = addNotification;
const addUserNotification = async (type, title, message, userId) => {
    const notiRepo = data_source_1.AppDataSource.getRepository(Notification_1.Notification);
    const userNotiRepo = data_source_1.AppDataSource.getRepository(UserNotification_1.UserNotification);
    const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
    const user = await userRepo.findOne({
        where: { id: userId }
    });
    const newNoti = notiRepo.create({
        type,
        title,
        message,
        createdAt: new Date(),
    });
    const notification = await notiRepo.save(newNoti);
    if (user && user.role === AuthType_1.Role.user) {
        const newUserNoti = userNotiRepo.create({
            user,
            notification,
            read: false,
        });
        await userNotiRepo.save(newUserNoti);
    }
    const io = (0, socket_1.getIO)();
    io.emit("new notification", { message: "new notification" });
};
exports.addUserNotification = addUserNotification;
//# sourceMappingURL=addNoti.js.map