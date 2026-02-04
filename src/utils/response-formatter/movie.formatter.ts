import { Movie } from "../../entity/Movie";
import { getPublicUrl } from "../../middlewares/cloudinaryUpload";
import { formatCasts } from "./cast.formatter";
import { formatUser } from "./user.formatter";

export const formatMovie = (movie: Movie) => {
  if (!movie) return movie;

  return {
    ...movie,

    poster: movie.poster
      ? {
          ...movie.poster,
          url: getPublicUrl(movie.poster.url, {
            quality: "auto",
            fetch_format: "auto",
          }),
        }
      : null,

    photos: movie.photos?.length
      ? movie.photos.map((photo) => ({
          ...photo,
          url: getPublicUrl(photo.url, {
            quality: "auto",
            fetch_format: "auto",
          }),
        }))
      : [],
  };
};

export const formatMovies = (movies: Movie[]) => {
  return movies.map(formatMovie);
};

export const formatMovieDetail = (movie: Movie) => {
  const formattedMovie = formatMovie(movie);
  return {
    ...formattedMovie,
    casts: formatCasts(formattedMovie.casts),
    reviews: formattedMovie.reviews.map((review) => ({
      ...review,
      user: formatUser(review.user),
    })),
  };
};
