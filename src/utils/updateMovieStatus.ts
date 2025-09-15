import cron from "node-cron";
import { AppDataSource } from "../data-source";
import { Movie } from "../entity/Movie";
import { updateMovie, updateSchedule } from "./updateStatus";
import { Schedule } from "../entity/Schedule";

export const updateMovieStatus = () => {
  cron.schedule("0 10 * * *", async () => {
    console.log("Running movie status update job...");

    const movieRepo = AppDataSource.getRepository(Movie);

    const movies = await movieRepo.find({
      relations: ["schedules"],
    });

    const updatedMovies = [];

    for (const movie of movies) {
      updatedMovies.push(updateMovie(movie));
    }

    await movieRepo.save(updatedMovies);
    console.log("Movie status updated");

    console.log("Running schedule status update job...");

    const scheduleRepo = AppDataSource.getRepository(Schedule);

    const schedules = await scheduleRepo.find();

    const updatedSchedules = [];

    for (const schedule of schedules) {
      updatedSchedules.push(updateSchedule(schedule));
    }

    await scheduleRepo.save(updatedSchedules);
    console.log("Schedule status updated");
  });
};
