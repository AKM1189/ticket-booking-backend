"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatSchedules = exports.formatSchedule = void 0;
const movie_formatter_1 = require("./movie.formatter");
const formatSchedule = (schedule) => {
    if (!schedule)
        return schedule;
    return {
        ...schedule,
        movie: (0, movie_formatter_1.formatMovie)(schedule.movie),
    };
};
exports.formatSchedule = formatSchedule;
const formatSchedules = (schedules) => {
    return schedules.map(exports.formatSchedule);
};
exports.formatSchedules = formatSchedules;
//# sourceMappingURL=schedule.formatter.js.map