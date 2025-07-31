import { In } from "typeorm";
import { AppDataSource } from "../data-source";
import { Genre } from "../entity/Genre";
import { Movie } from "../entity/Movie";
import { MovieType } from "../types/MovieType";

export class MovieService {
  private movieRepo = AppDataSource.getRepository(Movie);
  private genreRepo = AppDataSource.getRepository(Genre);

  async addMovie(body: MovieType) {
    const {
      title,
      description,
      duration,
      language,
      subtitle,
      releaseDate,
      status,
      posterUrl,
      trailerId,
      photos,
      experience,
      genres,
    } = body;

    const existingMovie = await this.movieRepo.findOneBy({ title });

    if (existingMovie) {
      throw new Error("Movie already exists.");
    }
    // Fetch Genre entities by IDs
    const genreEntities =
      genres && genres.length ? await this.genreRepo.findByIds(genres) : [];

    const newMovie = this.movieRepo.create({
      title,
      description,
      duration,
      language,
      subtitle,
      releaseDate,
      status,
      posterUrl,
      trailerId,
      photos,
      experience,
      genres: genreEntities,
      createdAt: new Date(),
      updatedAt: null,
    });

    await this.movieRepo.save(newMovie);
    return {
      status: 200,
      message: "Movie added successfully",
      data: newMovie,
    };
  }

  async updateMovie(movieId: number, body: Partial<MovieType>) {
    const existingMovie = await this.movieRepo.findOne({
      where: { id: movieId },
      relations: ["genres"],
    });

    if (!existingMovie) {
      throw new Error("Movie not found.");
    }
    let genreEntities = existingMovie.genres;

    if (body.genres && body.genres.length > 0) {
      genreEntities = (await this.genreRepo.findBy({
        id: In(body.genres),
      })) as Genre[];
    }

    // Merge and save
    const updatedMovie = this.movieRepo.merge(existingMovie, {
      ...body,
      genres: genreEntities,
      updatedAt: new Date(),
    });

    const saved = await this.movieRepo.save(updatedMovie);

    return {
      status: 200,
      message: "Movie updated successfully.",
      data: saved,
    };
  }

  async deleteMovie(movieId: number) {
    const movie = await this.movieRepo.findOne({ where: { id: movieId } });

    if (!movie) {
      return {
        status: 404,
        message: "Movie not found",
      };
    }
    await this.movieRepo.remove(movie);
    return {
      status: 200,
      message: "Movie deleted successfully.",
    };
  }
}
