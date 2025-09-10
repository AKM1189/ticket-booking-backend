// import dayjs from "dayjs";
// import { MovieStatus } from "../types/MovieType";

import dayjs from "dayjs";
import { MovieStatus } from "../types/MovieType";
import { Movie } from "../entity/Movie";
import { Schedule } from "../entity/Schedule";
import { ScheduleStatus } from "../types/ScheduleType";

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
  } else if (showDates?.some((date) => dayjs(date).isAfter(today, "day"))) {
    movie.status = MovieStatus.ticketAvailable;
  } else if (showDates?.some((date) => dayjs(date).isBefore(today, "day"))) {
    movie.status = MovieStatus.ended;
  }
  return movie;
};

export const updateSchedule = (schedule: Schedule): Schedule => {
  const today = dayjs().format("YYYY-MM-DD");

  const showDate = dayjs(schedule.showDate).format("YYYY-MM-DD");

  if (schedule.status === ScheduleStatus.inActive)
    schedule.status = ScheduleStatus.inActive;
  else if (showDate === today) {
    schedule.status = ScheduleStatus.ongoing;
  } else if (dayjs(showDate).isBefore(today, "day")) {
    schedule.status = ScheduleStatus.completed;
  } else if (dayjs(showDate).isAfter(today, "day")) {
    schedule.status = ScheduleStatus.active;
  }
  return schedule;
};
