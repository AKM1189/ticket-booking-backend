"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShowingTheatres = void 0;
const theatre_service_1 = require("../../services/user.service/theatre.service");
const theatreService = new theatre_service_1.TheatreService();
const getShowingTheatres = async (req, res) => {
    try {
        const { data, status } = await theatreService.getShowingTheatres();
        res.status(status).json({
            data,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getShowingTheatres = getShowingTheatres;
//# sourceMappingURL=theatre.controller.js.map