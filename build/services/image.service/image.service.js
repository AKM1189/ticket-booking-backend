"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageService = void 0;
const r2_upload_1 = require("../../config/r2-upload");
class ImageService {
    async uploadOne(file, folder) {
        const key = `${folder}/${Date.now()}-${file.originalname}`;
        await (0, r2_upload_1.uploadToR2)(file, key);
        return key;
    }
    async uploadMany(files, folder) {
        return Promise.all(files.map(async (file) => {
            const key = `${folder}/${Date.now()}-${file.originalname}`;
            await (0, r2_upload_1.uploadToR2)(file, key);
            return key;
        }));
    }
    async delete(key) {
        if (Array.isArray(key)) {
            await Promise.all(key.map(r2_upload_1.deleteFromR2));
        }
        else {
            await (0, r2_upload_1.deleteFromR2)(key);
        }
    }
}
exports.ImageService = ImageService;
//# sourceMappingURL=image.service.js.map