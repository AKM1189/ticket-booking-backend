"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const data_source_1 = require("../../data-source");
const Review_1 = require("../../entity/Review");
const Movie_1 = require("../../entity/Movie");
const User_1 = require("../../entity/User");
const calculateRating_1 = require("../../utils/calculateRating");
class ReviewService {
    reviewRepo = data_source_1.AppDataSource.getRepository(Review_1.Review);
    movieRepo = data_source_1.AppDataSource.getRepository(Movie_1.Movie);
    userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
    async addReview(body, userId) {
        const { rating, description, movieId } = body;
        const existingReview = await this.reviewRepo.findOne({
            relations: ["user", "movie"],
            where: { user: { id: userId }, movie: { id: movieId } },
        });
        if (existingReview) {
            throw new Error("Review already exists.");
        }
        const movie = await this.movieRepo.findOneBy({ id: movieId });
        if (!movie) {
            throw new Error("Movie not found.");
        }
        const user = await this.userRepo.findOneBy({ id: userId });
        if (!user) {
            throw new Error("User not found.");
        }
        const newReview = this.reviewRepo.create({
            rating,
            reviewDate: new Date(),
            description,
            movie,
            user,
        });
        await this.reviewRepo.save(newReview);
        const reviewedMovie = await this.movieRepo.findOne({
            relations: ["reviews"],
            where: { id: movieId },
        });
        const movieRating = (0, calculateRating_1.calculateRating)(reviewedMovie, rating);
        movie.rating = movieRating;
        await this.movieRepo.save(movie);
        return {
            status: 200,
            message: "Review added successfully",
            data: newReview,
        };
    }
    async updateReview(reviewId, body) {
        const { rating, movieId } = body;
        const existingReview = await this.reviewRepo.findOneBy({ id: reviewId });
        if (!existingReview) {
            throw new Error("Review not found.");
        }
        const updatedGenre = { ...existingReview, ...body };
        const saved = await this.reviewRepo.save(updatedGenre);
        const movie = await this.movieRepo.findOne({
            relations: ["reviews"],
            where: { id: movieId },
        });
        const movieRating = (0, calculateRating_1.calculateRating)(movie);
        movie.rating = movieRating;
        await this.movieRepo.save(movie);
        return {
            status: 200,
            message: "Review updated successfully.",
            data: saved,
        };
    }
    async deleteReview(id) {
        const existingReview = await this.reviewRepo.findOneBy({ id });
        if (!existingReview) {
            return {
                status: 404,
                message: "Review not found",
            };
        }
        await this.reviewRepo.remove(existingReview);
        return {
            status: 200,
            message: "Review deleted successfully.",
        };
    }
}
exports.ReviewService = ReviewService;
//# sourceMappingURL=review.service.js.map