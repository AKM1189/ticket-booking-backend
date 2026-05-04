"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAboutInfo = void 0;
const about_service_1 = require("../../services/user.service/about.service");
const aboutService = new about_service_1.AboutService();
const getAboutInfo = async (req, res) => {
    try {
        const { data, status } = await aboutService.getAboutInfo();
        res.status(status).json({
            data,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getAboutInfo = getAboutInfo;
//# sourceMappingURL=about.controller.js.map