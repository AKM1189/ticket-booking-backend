import { AppDataSource } from "../../data-source";
import { User } from "../../entity/User";
import { Role } from "../../types/AuthType";
import { UserBodyType } from "../../types/UserType";
import { sendEmail } from "../../utils/sendEmail";
import { generatePassword } from "../../utils/generatePassword";
import bcrypt from "bcrypt";
import { Like } from "typeorm";
import { Theatre } from "../../entity/Theatre";
import { addNotification } from "../../utils/addNoti";
import { NOTI_TYPE } from "../../constants";

export class UserService {
  private userRepo = AppDataSource.getRepository(User);
  private theatreRepo = AppDataSource.getRepository(Theatre);

  async getUsers(
    search: string,
    role: Role,
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: string,
  ) {
    // search and filter
    let whereClause: any = {};
    if (role && search) {
      whereClause = [
        { role, name: Like(`%${search}%`) },
        { role, email: Like(`%${search}%`) },
        { role, phoneNo: Like(`%${search}%`) },
      ];
    } else if (search) {
      whereClause = [
        { name: Like(`%${search}%`) },
        { email: Like(`%${search}%`) },
        { phoneNo: Like(`%${search}%`) },
      ];
    } else if (role) {
      whereClause = { role };
    }

    const [users, total] = await this.userRepo.findAndCount({
      relations: ["theatre"],
      order: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
      where: whereClause,
    });
    console.log("users", users);
    return {
      status: 200,
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async addAdmin(body: UserBodyType, user: User) {
    const { name, email, phoneNo, role, theatreId } = body;
    const userType =
      role === Role.admin ? "Admin" : role === Role.staff ? "Staff" : "User";

    const existingEmail = await this.userRepo.findOneBy({
      email,
    });
    if (existingEmail) {
      throw new Error("Email already exists.");
    }

    if (role === Role.staff && !theatreId) {
      throw new Error("Staff must belong to a theatre");
    }

    const password = generatePassword(12);
    const hashedPassword = await bcrypt.hash(password, 10);

    const theatre = theatreId
      ? await this.theatreRepo.findOneBy({
          id: parseInt(theatreId),
        })
      : null;

    const newAdmin = this.userRepo.create({
      name,
      email,
      phoneNo,
      password: hashedPassword,
      role,
      active: true,
      createdAt: new Date(),
      theatre: role === Role.staff ? theatre : null,
    });

    await this.userRepo.save(newAdmin);

    const content = `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 500px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: center;">
            <h2 style="color: #1b81d1;">Welcome To Movie Palace</h2>
            <p style="color: #333;">Your <b>${body.role} account</b> created successfully. You can use these <b>credentials</b> provide below to access our admin dashboard.</p>
            <div>Email - ${email}</div>
            <div>Password - ${password}</div>
            <p style="font-size: 12px; color: #aaa; margin-top: 30px;">© 2025 Movie Palace</p>
          </div>
        </div>
      `;

    sendEmail(
      email,
      `${userType} Account Credentials - Movie Palace 🎟️`,
      content,
    );

    const message = `${user?.name} added New Admin '${newAdmin?.name}'.`;

    addNotification(
      NOTI_TYPE.USER_ADDED,
      userType + " Added",
      message,
      user?.id,
    );

    return {
      status: 200,
      message: `${userType} added successfully`,
      data: newAdmin,
    };
  }

  async updateUser(
    userId: number,
    body: UserBodyType & { role: Role },
    user: User,
  ) {
    const { name, email, phoneNo, role, theatreId } = body;
    const userType =
      role === Role.admin ? "Admin" : role === Role.staff ? "Staff" : "User";
    const existingUserById = await this.userRepo.findOneBy({ id: userId });
    if (!existingUserById) {
      return {
        status: 404,
        message: userType + " not found.",
      };
    }

    const existingUserByEmail = await this.userRepo.findOneBy({ email });
    if (existingUserByEmail && existingUserByEmail.id !== userId) {
      return {
        status: 400,
        message: userType + " email already exists.",
      };
    }

    const theatre = await this.theatreRepo.findOneBy({
      id: parseInt(theatreId),
    });
    if (!theatre) {
      throw new Error("Theatre does not exist for assignment");
    }

    const updatedUser = { ...existingUserById, name, email, phoneNo, theatre };

    const saved = await this.userRepo.save(updatedUser);

    const message = `${user.name} updated ${saved.name} details.`;

    addNotification(NOTI_TYPE.USER_UPDATED, "User Updated", message, user.id);

    return {
      status: 200,
      message: userType + " updated successfully.",
      data: saved,
    };
  }

  async deactivateUser(userId: number, actor: User) {
    const user = await this.userRepo.findOneBy({ id: userId });

    if (!user) {
      return {
        status: 404,
        message: "User not found",
      };
    }
    await this.userRepo.save({ ...user, active: !user.active });

    const message = `${actor?.name} ${
      user.active ? "deactivated" : "activated"
    } ${user?.name} (${user?.role}) account.`;

    addNotification(
      user.active ? NOTI_TYPE.USER_DEACTIVATED : NOTI_TYPE.USER_ACTIVATED,
      `User ${user.active ? "Deactivated" : "Activated"}`,
      message,
      actor?.id,
    );

    return {
      status: 200,
      message: `User ${
        user.active ? "deactivated" : "activated"
      } successfully.`,
    };
  }
}
