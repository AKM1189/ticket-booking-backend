"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivateUser = exports.updateUser = exports.addAdmin = exports.getUsers = void 0;
const queryParams_1 = require("../../utils/queryParams");
const user_service_1 = require("../../services/admin.service/user.service");
const user_formatter_1 = require("../../utils/response-formatter/user.formatter");
const userService = new user_service_1.UserService();
const getUsers = async (req, res) => {
    try {
        const role = req.query.role;
        const search = req.query.search;
        const { page, limit, sortBy, sortOrder } = (0, queryParams_1.getQueryParams)(req, 1, 10, "id");
        const { status, data, pagination } = await userService.getUsers(search, role, page, limit, sortBy, sortOrder);
        res.status(status).json({
            data: (0, user_formatter_1.formatUsers)(data),
            pagination,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getUsers = getUsers;
const addAdmin = async (req, res) => {
    try {
        const user = req.user;
        const { status, message, data } = await userService.addAdmin(req.body, user);
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
exports.addAdmin = addAdmin;
const updateUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const user = req.user;
        const { status, message, data } = await userService.updateUser(userId, req.body, user);
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
exports.updateUser = updateUser;
const deactivateUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const user = req.user;
        const { status, message } = await userService.deactivateUser(userId, user);
        res.status(status).json({
            status,
            message,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.deactivateUser = deactivateUser;
//# sourceMappingURL=user.controller.js.map