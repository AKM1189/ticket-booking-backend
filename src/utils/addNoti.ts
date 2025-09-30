import { STAFF_NOTI_TYPE } from "../constants";
import { getNotifications } from "../controllers/admin.controllers/notification.controller";
import { AppDataSource } from "../data-source";
import { Notification } from "../entity/Notification";
import { User } from "../entity/User";
import { UserNotification } from "../entity/UserNotification";
import { NotificationService } from "../services/admin.service/notification.service";
import { getIO } from "../socket";
import { Role } from "../types/AuthType";

export const addNotification = async (
  type: string,
  title: string,
  message: string,
  userId: number,
  theatreId?: number,
) => {
  const notiRepo = AppDataSource.getRepository(Notification);
  const userNotiRepo = AppDataSource.getRepository(UserNotification);
  const userRepo = AppDataSource.getRepository(User);

  const users = await userRepo.find({
    relations: ["theatre"],
    where: [
      { role: Role.admin },
      {
        ...(theatreId ? { role: Role.staff, theatre: { id: theatreId } } : {}),
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

  const admins = users.filter(
    (user) => user.role === Role.admin && user.id !== userId,
  );
  const staffs = users.filter(
    (user) => user.role === Role.staff && user.id !== userId,
  );

  if (staffs?.length > 0 && Object.values(STAFF_NOTI_TYPE).includes(type)) {
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

  const io = getIO();

  io.emit("new notification", { message: "new notification" });
};
