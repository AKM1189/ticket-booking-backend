"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = uploadImage;
exports.deleteImage = deleteImage;
exports.getPublicUrl = getPublicUrl;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const crypto_1 = require("crypto");
async function uploadImage(file) {
    if (!file?.buffer)
        throw new Error("No file provided");
    const publicId = `movies/${(0, crypto_1.randomUUID)()}`;
    // Convert buffer to base64 Data URI
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    const result = await cloudinary_1.default.uploader.upload(dataUri, {
        public_id: publicId,
        folder: "movies",
        resource_type: "image",
    });
    return result.public_id;
}
/**
 * Delete image from Cloudinary
 */
async function deleteImage(publicId) {
    await cloudinary_1.default.uploader.destroy(publicId);
}
/**
 * Optional helper: get public URL
 */
function getPublicUrl(publicId, options) {
    return cloudinary_1.default.url(publicId, {
        secure: true,
        ...options,
    });
}
//# sourceMappingURL=cloudinaryUpload.js.map