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
  const now = dayjs();

  // Build proper datetime from showDate + showTime
  const showDateTime = dayjs(
    `${schedule.showDate} ${schedule.showTime}`,
    "YYYY-MM-DD HH:mm",
  );
  const endDateTime = showDateTime.add(
    parseInt(schedule?.movie?.duration),
    "minute",
  );

  if (schedule.status === ScheduleStatus.inActive) {
    // Leave it inactive if already set
    schedule.status = ScheduleStatus.inActive;
  } else if (now.isAfter(endDateTime)) {
    // Show ended
    schedule.status = ScheduleStatus.completed;
  } else if (
    now.isAfter(showDateTime.subtract(15, "minute")) &&
    now.isBefore(endDateTime)
  ) {
    // Within 15 minutes before start, or during the show
    schedule.status = ScheduleStatus.ongoing;
  } else if (now.isBefore(showDateTime.subtract(15, "minute"))) {
    // Future but bookable
    schedule.status = ScheduleStatus.active;
  }

  return schedule;
};
