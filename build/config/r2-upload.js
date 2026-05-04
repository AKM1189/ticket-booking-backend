"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromR2 = exports.upload = void 0;
exports.uploadToR2 = uploadToR2;
const multer_1 = __importDefault(require("multer"));
const r2_1 = require("../config/r2");
const client_s3_1 = require("@aws-sdk/client-s3");
exports.upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
});
// {
//     s3: r2Client,
//     bucket: process.env.R2_BUCKET_NAME!,
//     acl: "public-read", // optional — remove if bucket is private
//     contentType: multerS3.AUTO_CONTENT_TYPE,
//     key: (req, file, cb) => {
//       const filename = `movies/${Date.now()}-${file.originalname}`;
//       cb(null, filename);
//     },
//   }
async function uploadToR2(file, key) {
    await r2_1.r2Client.send(new client_s3_1.PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    }));
    return key;
}
// export default upload;
const deleteFromR2 = async (key) => {
    try {
        await r2_1.r2Client.send(new client_s3_1.DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
        }));
    }
    catch (error) {
        console.error("Failed to delete image from R2:", error);
        throw error;
    }
};
exports.deleteFromR2 = deleteFromR2;
//# sourceMappingURL=r2-upload.js.map