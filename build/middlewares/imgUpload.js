"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imgUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Ensure uploads folder exists
const uploadPath = path_1.default.join(__dirname, "..", "uploads");
// if (!fs.existsSync(uploadPath)) {
//   fs.mkdirSync(uploadPath);
// }
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});
exports.imgUpload = (0, multer_1.default)({ storage });
//# sourceMappingURL=imgUpload.js.map