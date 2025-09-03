// import dayjs from "dayjs";
// import { MovieStatus } from "../types/MovieType";

import dayjs from "dayjs";
import { MovieStatus } from "../types/MovieType";
import { Movie } from "../entity/Movie";

export const updateMovie = (movie: Movie): Movie => {
  const today = dayjs().format("YYYY-MM-DD");

  if (!movie.schedules || movie.schedules.length === 0) {
    movie.status = MovieStatus.comingSoon;
  }

  const showDates = movie?.schedules?.map((schedule) =>
    dayjs(schedule.showDate).format("YYYY-MM-DD"),
  );

  if (showDates?.some((date) => date === today)) {
    movie.status = MovieStatus.nowShowing;
  } else if (showDates?.some((date) => dayjs(date).isBefore(today, "day"))) {
    movie.status = MovieStatus.ended;
  } else if (showDates?.some((date) => dayjs(date).isAfter(today, "day"))) {
    movie.status = MovieStatus.ticketAvailable;
  }
  return movie;
};
