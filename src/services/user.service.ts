import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Role } from "../types/AuthType";
import { UserBodyType } from "../types/UserType";
import { sendEmail } from "../utils/sendEmail";
import { generatePassword } from "../utils/generatePassword";
import bcrypt from "bcrypt";
import { Like } from "typeorm";
import { Theatre } from "../entity/Theatre";

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
      order: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
      where: whereClause,
    });

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

  async addAdmin(body: UserBodyType) {
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

    const theatre = await this.theatreRepo.findOneBy({
      id: parseInt(theatreId),
    });

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

    return {
      status: 200,
      message: `${userType} added successfully`,
      data: newAdmin,
    };
  }

  // async addStaff(body: UserBodyType) {
  //   const { name, email, phoneNo } = body;

  //   const existingEmail = await this.userRepo.findOneBy({
  //     email,
  //     role: Role.staff,
  //   });
  //   if (existingEmail) {
  //     throw new Error("Email already exists.");
  //   }

  //   const password = generatePassword(12);
  //   const hashedPassword = await bcrypt.hash(password, 10);

  //   const newStaff = this.userRepo.create({
  //     name,
  //     email,
  //     phoneNo,
  //     password: hashedPassword,
  //     role: Role.staff,
  //     active: true,
  //     createdAt: new Date(),
  //   });

  //   await this.userRepo.save(newStaff);

  //   const content = `
  //       <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
  //         <div style="max-width: 500px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: center;">
  //           <h2 style="color: #1b81d1;">Welcome To Movie Palace</h2>
  //           <p style="color: #333;">Your <b>staff account</b> created successfully. You can use these <b>credentials</b> provide below to access our admin dashboard.</p>
  //           <div>Email - ${email}</div>
  //           <div>Password - ${password}</div>
  //           <p style="font-size: 12px; color: #aaa; margin-top: 30px;">© 2025 Movie Palace</p>
  //         </div>
  //       </div>
  //     `;

  //   sendEmail(email, "Staff Account Credentials - Movie Palace 🎟️", content);

  //   return {
  //     status: 200,
  //     message: "Staff added successfully",
  //     data: newStaff,
  //   };
  // }

  async updateUser(userId: number, body: UserBodyType & { role: Role }) {
    const { name, email, phoneNo, role } = body;
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

    const updatedUser = { ...existingUserById, name, email, phoneNo };

    const saved = await this.userRepo.save(updatedUser);

    return {
      status: 200,
      message: userType + " updated successfully.",
      data: saved,
    };
  }

  async deactivateUser(userId: number) {
    const user = await this.userRepo.findOneBy({ id: userId });

    if (!user) {
      return {
        status: 404,
        message: "User not found",
      };
    }
    await this.userRepo.save({ ...user, active: !user.active });

    return {
      status: 200,
      message: `User ${
        user.active ? "deactivated" : "activated"
      } successfully.`,
    };
  }
}
