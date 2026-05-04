"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentRecords = exports.getCardInfo = void 0;
const report_service_1 = require("../../services/admin.service/report.service");
const reportService = new report_service_1.ReportService();
const getCardInfo = async (req, res) => {
    try {
        const { status, data } = await reportService.getCardInfo(req.user);
        res.status(status).json({
            data,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getCardInfo = getCardInfo;
const getRecentRecords = async (req, res) => {
    try {
        const { status, data } = await reportService.recentRecords(req.user);
        res.status(status).json({
            data,
        });
    }
    catch (err) {
        res.status(500).json({ messsage: err.message });
    }
};
exports.getRecentRecords = getRecentRecords;
//# sourceMappingURL=report.controller.js.map