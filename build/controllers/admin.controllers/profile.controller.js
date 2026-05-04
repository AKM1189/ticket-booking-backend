"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = void 0;
const profile_service_1 = require("../../services/profile.service");
const profileService = new profile_service_1.ProfileService();
const updateProfile = async (req, res) => {
    const files = req.files;
    const imageFile = files?.["image"]?.[0];
    try {
        const userId = parseInt(req.params.id);
        const { status, message, data } = await profileService.updateProfile(userId, req.body, imageFile);
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
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { status, message } = await profileService.changePassword(userId, req.body);
        res.status(status).json({
            status,
            message,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=profile.controller.js.map