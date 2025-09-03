import cron from "node-cron";
import { AppDataSource } from "../data-source";
import { Movie } from "../entity/Movie";
import { updateMovie } from "./updateMovie";

export const updateMovieStatus = () => {
  cron.schedule("0 0 0 * * *", async () => {
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
  });
};
