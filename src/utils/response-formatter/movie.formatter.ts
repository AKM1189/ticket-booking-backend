import { Movie } from "../../entity/Movie";
import { getPublicUrl } from "../../middlewares/cloudinaryUpload";

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
