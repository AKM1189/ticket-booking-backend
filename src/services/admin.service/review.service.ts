import { AppDataSource } from "../../data-source";
import { Review } from "../../entity/Review";
import { ReviewInputType } from "../../types/ReviewType";
import { Movie } from "../../entity/Movie";
import { User } from "../../entity/User";

export class ReviewService {
  private reviewRepo = AppDataSource.getRepository(Review);
  private movieRepo = AppDataSource.getRepository(Movie);
  private userRepo = AppDataSource.getRepository(User);

  async addReview(body: ReviewInputType, userId: number) {
    const { rating, description, movieId } = body;

    const existingReview = await this.reviewRepo.findOne({
      relations: ["user"],
      where: { user: { id: userId } },
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
    return {
      status: 200,
      message: "Review added successfully",
      data: newReview,
    };
  }
  async updateReview(reviewId: number, body: ReviewInputType) {
    const existingReview = await this.reviewRepo.findOneBy({ id: reviewId });
    if (!existingReview) {
      throw new Error("Review not found.");
    }

    const updatedGenre = { ...existingReview, ...body };
    const saved = await this.reviewRepo.save(updatedGenre);

    return {
      status: 200,
      message: "Review updated successfully.",
      data: saved,
    };
  }

  async deleteReview(id: number) {
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
