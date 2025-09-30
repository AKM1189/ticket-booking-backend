import { Movie } from "../entity/Movie";

export const setReleaseDate = (movie: Movie) => {
  if (movie.schedules.length > 0) {
    const earliestShowDate = movie.schedules
      .map((s) => new Date(s.showDate))
      .sort((a, b) => a.getTime() - b.getTime())[0];

    movie.releaseDate = earliestShowDate;
  } else movie.releaseDate = null;
  return movie;
};
