"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCasts = exports.formatCast = void 0;
const cloudinaryUpload_1 = require("../../middlewares/cloudinaryUpload");
const formatCast = (cast) => {
    if (!cast)
        return cast;
    return {
        ...cast,
        image: cast.image
            ? {
                ...cast.image,
                url: (0, cloudinaryUpload_1.getPublicUrl)(cast.image.url, {
                    quality: "auto",
                    fetch_format: "auto",
                }),
            }
            : null,
    };
};
exports.formatCast = formatCast;
const formatCasts = (casts) => {
    return casts.map(exports.formatCast);
};
exports.formatCasts = formatCasts;
//# sourceMappingURL=cast.formatter.js.map