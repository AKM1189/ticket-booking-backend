import { Like, Not } from "typeorm";
import { AppDataSource } from "../../data-source";
import { Genre } from "../../entity/Genre";
import { GenreType } from "../../types/GenreType";
import { Notification } from "../../entity/Notification";
import { UserNotification } from "../../entity/UserNotification";

export class NotificationService {
  private notiRepo = AppDataSource.getRepository(Notification);
  private userNotiRepo = AppDataSource.getRepository(UserNotification);

  async getNotifications(
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: string,
    userId: number,
    type: string,
  ) {
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

  async readNoti(notiId: string, userId: number) {
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

  async readAllNoti(userId: number) {
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

    await this.userNotiRepo.update(
      { user: { id: userId }, read: false },
      { read: true },
    );

    return {
      status: 200,
      message: "Read all notifications successfully",
    };
  }
}
