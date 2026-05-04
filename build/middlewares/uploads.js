"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const filebase_1 = require("../config/filebase");
const fileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
};
const upload = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: filebase_1.s3,
        bucket: process.env.FILEBASE_BUCKET,
        acl: "public-read",
        contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const timestamp = Date.now();
            const filename = `${timestamp}-${file.originalname}`;
            cb(null, filename);
        },
    }),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB per file
    },
    fileFilter,
});
exports.default = upload;
//# sourceMappingURL=uploads.js.map