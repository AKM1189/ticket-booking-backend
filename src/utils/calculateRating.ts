import { Movie } from "../entity/Movie";

export const calculateRating = (movie: Movie, rating?: number) => {
  console.log("rating", rating);

  // Recalculate movie rating
  const allRatings = movie.reviews.map((r) => Number(r.rating)); // existing reviews
  if (rating) {
    allRatings.push(rating);
  } // include the new review

  if (allRatings.length === 0) return 0;
  const avgRating5 =
    allRatings.reduce((acc, val) => acc + val, 0) / allRatings.length;
  const avgRating10 = Number((avgRating5 * 2).toFixed(1)); // scale 0-5 -> 0-10

  return avgRating10;
};
