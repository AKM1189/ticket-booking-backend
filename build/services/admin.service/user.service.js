"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const data_source_1 = require("../../data-source");
const User_1 = require("../../entity/User");
const AuthType_1 = require("../../types/AuthType");
const sendEmail_1 = require("../../utils/sendEmail");
const generatePassword_1 = require("../../utils/generatePassword");
const bcrypt_1 = __importDefault(require("bcrypt"));
const typeorm_1 = require("typeorm");
const Theatre_1 = require("../../entity/Theatre");
const addNoti_1 = require("../../utils/addNoti");
const constants_1 = require("../../constants");
class UserService {
    userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
    theatreRepo = data_source_1.AppDataSource.getRepository(Theatre_1.Theatre);
    async getUsers(search, role, page, limit, sortBy, sortOrder) {
        // search and filter
        let whereClause = {};
        if (role && search) {
            whereClause = [
                { role, name: (0, typeorm_1.Like)(`%${search}%`) },
                { role, email: (0, typeorm_1.Like)(`%${search}%`) },
                { role, phoneNo: (0, typeorm_1.Like)(`%${search}%`) },
            ];
        }
        else if (search) {
            whereClause = [
                { name: (0, typeorm_1.Like)(`%${search}%`) },
                { email: (0, typeorm_1.Like)(`%${search}%`) },
                { phoneNo: (0, typeorm_1.Like)(`%${search}%`) },
            ];
        }
        else if (role) {
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
    async getAdminByEmail(email) {
        return this.userRepo.findOne({
            where: { email, role: AuthType_1.Role.admin },
            relations: ["image"],
            select: {
                name: true,
                email: true,
                image: true,
                phoneNo: true,
            },
        });
    }
    async getStaffByEmail(email) {
        return this.userRepo.findOne({
            where: { email, role: AuthType_1.Role.staff },
            relations: ["theatre", "image"],
            select: {
                name: true,
                email: true,
                image: true,
                phoneNo: true,
                theatre: true,
            },
        });
    }
    async addAdmin(body, user) {
        const { name, email, phoneNo, role, theatreId } = body;
        const userType = role === AuthType_1.Role.admin ? "Admin" : role === AuthType_1.Role.staff ? "Staff" : "User";
        const existingEmail = await this.userRepo.findOneBy({
            email,
        });
        if (existingEmail) {
            throw new Error("Email already exists.");
        }
        if (role === AuthType_1.Role.staff && !theatreId) {
            throw new Error("Staff must belong to a theatre");
        }
        const password = (0, generatePassword_1.generatePassword)(12);
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
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
            theatre: role === AuthType_1.Role.staff ? theatre : null,
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
        (0, sendEmail_1.sendEmail)(email, `${userType} Account Credentials - Movie Palace 🎟️`, content);
        const message = `${user?.name} added New Admin '${newAdmin?.name}'.`;
        (0, addNoti_1.addNotification)(constants_1.NOTI_TYPE.USER_ADDED, userType + " Added", message, user?.id);
        return {
            status: 200,
            message: `${userType} added successfully`,
            data: newAdmin,
        };
    }
    async updateUser(userId, body, user) {
        const { name, email, phoneNo, role, theatreId } = body;
        const userType = role === AuthType_1.Role.admin ? "Admin" : role === AuthType_1.Role.staff ? "Staff" : "User";
        // 1. Check if user exists
        const existingUser = await this.userRepo.findOneBy({ id: userId });
        if (!existingUser) {
            return {
                status: 404,
                message: `${userType} not found.`,
            };
        }
        // 2. Email uniqueness check
        const existingUserByEmail = await this.userRepo.findOneBy({ email });
        if (existingUserByEmail && existingUserByEmail.id !== userId) {
            return {
                status: 400,
                message: `${userType} email already exists.`,
            };
        }
        // 3. If STAFF → theatreId MUST exist
        if (role === AuthType_1.Role.staff && !theatreId) {
            return {
                status: 400,
                message: "Staff must belong to a theatre",
            };
        }
        // 4. If theatreId is provided → validate theatre
        let theatre = null;
        if (theatreId) {
            const parsedTheatreId = Number(theatreId);
            if (isNaN(parsedTheatreId)) {
                return { status: 400, message: "Invalid theatreId" };
            }
            theatre = await this.theatreRepo.findOneBy({ id: parsedTheatreId });
            if (!theatre) {
                return {
                    status: 404,
                    message: "Theatre does not exist for assignment",
                };
            }
        }
        // 5. Generate new password always? (Matches your addAdmin logic)
        const newPassword = (0, generatePassword_1.generatePassword)(12);
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        // 6. Update user
        const updatedUser = {
            ...existingUser,
            name,
            email,
            phoneNo,
            role,
            password: hashedPassword,
            theatre: role === AuthType_1.Role.staff ? theatre : null,
        };
        const savedUser = await this.userRepo.save(updatedUser);
        // 7. Send credentials email ONLY if email changed
        if (email !== existingUser.email) {
            const content = `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 500px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: center;">
          <h2 style="color: #1b81d1;">Welcome To Movie Palace</h2>
          <p style="color: #333;">Your <b>${role} account</b> details were updated. Here are your new credentials:</p>
          <div>Email - ${email}</div>
          <div>Password - ${newPassword}</div>
          <p style="font-size: 12px; color: #aaa; margin-top: 30px;">© 2025 Movie Palace</p>
        </div>
      </div>
    `;
            (0, sendEmail_1.sendEmail)(email, `${userType} Account Updated - Movie Palace 🎟️`, content);
        }
        // 8. Add notification
        const message = `${user.name} updated ${savedUser.name} details.`;
        (0, addNoti_1.addNotification)(constants_1.NOTI_TYPE.USER_UPDATED, "User Updated", message, user.id);
        return {
            status: 200,
            message: `${userType} updated successfully.`,
            data: savedUser,
        };
    }
    async deactivateUser(userId, actor) {
        const user = await this.userRepo.findOneBy({ id: userId });
        if (!user) {
            return {
                status: 404,
                message: "User not found",
            };
        }
        // flip the active state
        const newActiveState = !user.active;
        await this.userRepo.save({ ...user, active: newActiveState });
        const message = `${actor?.name} ${newActiveState ? "activated" : "deactivated"} ${user?.name} (${user?.role}) account.`;
        (0, addNoti_1.addNotification)(newActiveState ? constants_1.NOTI_TYPE.USER_ACTIVATED : constants_1.NOTI_TYPE.USER_DEACTIVATED, `User ${newActiveState ? "Activated" : "Deactivated"}`, message, actor?.id);
        return {
            status: 200,
            message: `User ${newActiveState ? "activated" : "deactivated"} successfully.`,
        };
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map