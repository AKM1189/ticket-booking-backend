"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatMovieDetail = exports.formatMovies = exports.formatMovie = void 0;
const cloudinaryUpload_1 = require("../../middlewares/cloudinaryUpload");
const cast_formatter_1 = require("./cast.formatter");
const user_formatter_1 = require("./user.formatter");
const formatMovie = (movie) => {
    if (!movie)
        return movie;
    return {
        ...movie,
        poster: movie.poster
            ? {
                ...movie.poster,
                url: (0, cloudinaryUpload_1.getPublicUrl)(movie.poster.url, {
                    quality: "auto",
                    fetch_format: "auto",
                }),
            }
            : null,
        photos: movie.photos?.length
            ? movie.photos.map((photo) => ({
                ...photo,
                url: (0, cloudinaryUpload_1.getPublicUrl)(photo.url, {
                    quality: "auto",
                    fetch_format: "auto",
                }),
            }))
            : [],
    };
};
exports.formatMovie = formatMovie;
const formatMovies = (movies) => {
    return movies.map(exports.formatMovie);
};
exports.formatMovies = formatMovies;
const formatMovieDetail = (movie) => {
    const formattedMovie = (0, exports.formatMovie)(movie);
    return {
        ...formattedMovie,
        casts: (0, cast_formatter_1.formatCasts)(formattedMovie.casts),
        reviews: formattedMovie.reviews.map((review) => ({
            ...review,
            user: (0, user_formatter_1.formatUser)(review.user),
        })),
    };
};
exports.formatMovieDetail = formatMovieDetail;
//# sourceMappingURL=movie.formatter.js.map