import { Schedule } from "../../entity/Schedule";
import { formatMovie } from "./movie.formatter";

export const formatSchedule = (schedule: Schedule) => {
  if (!schedule) return schedule;

  return {
    ...schedule,
    movie: formatMovie(schedule.movie),
  };
};

export const formatSchedules = (schedules: Schedule[]) => {
  return schedules.map(formatSchedule);
};
