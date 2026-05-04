"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatUsers = exports.formatUser = void 0;
const cloudinaryUpload_1 = require("../../middlewares/cloudinaryUpload");
const formatUser = (user) => {
    if (!user)
        return user;
    return {
        ...user,
        image: user.image
            ? {
                ...user.image,
                url: (0, cloudinaryUpload_1.getPublicUrl)(user.image.url, {
                    quality: "auto",
                    fetch_format: "auto",
                }),
            }
            : null,
    };
};
exports.formatUser = formatUser;
const formatUsers = (users) => {
    return users.map(exports.formatUser);
};
exports.formatUsers = formatUsers;
//# sourceMappingURL=user.formatter.js.map