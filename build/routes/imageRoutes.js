"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post("/upload-image", (req, res) => {
    if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
    }
    const imageUrl = req.file.location; // provided by multer-s3
    res.json({
        message: "Upload successful",
        imageUrl,
    });
});
exports.default = router;
//# sourceMappingURL=imageRoutes.js.map