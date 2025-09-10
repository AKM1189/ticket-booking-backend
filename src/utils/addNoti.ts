import { AppDataSource } from "../data-source";
import { Notification } from "../entity/Notification";
import { User } from "../entity/User";
import { UserNotification } from "../entity/UserNotification";
import { Role } from "../types/AuthType";

export const addNotification = async (
  type: string,
  title: string,
  message: string,
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

  if (users?.length > 0) {
    users.map(async (user) => {
      const newUserNoti = userNotiRepo.create({
        user,
        notification,
        read: false,
      });
      await userNotiRepo.save(newUserNoti);
    });
  }
};
