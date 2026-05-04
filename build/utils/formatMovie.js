"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setReleaseDate = void 0;
const setReleaseDate = (movie) => {
    if (movie.schedules.length > 0) {
        const earliestShowDate = movie.schedules
            .map((s) => new Date(s.showDate))
            .sort((a, b) => a.getTime() - b.getTime())[0];
        movie.releaseDate = earliestShowDate;
    }
    else
        movie.releaseDate = null;
    return movie;
};
exports.setReleaseDate = setReleaseDate;
//# sourceMappingURL=formatMovie.js.map