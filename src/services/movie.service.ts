import { In } from "typeorm";
import { AppDataSource } from "../data-source";
import { Genre } from "../entity/Genre";
import { Movie } from "../entity/Movie";
import { MovieStatus, MovieType } from "../types/MovieType";
import { uploadImagesToServer } from "../utils/imageUploads";
import { Cast } from "../entity/Cast";
import { CastType } from "../types/CastType";
import { Image } from "../entity/Image";
import axios from "axios";
import path from "path";
import { promises as fs } from "fs";
import { GenreType } from "../types/GenreType";

export class MovieService {
  private movieRepo = AppDataSource.getRepository(Movie);
  private genreRepo = AppDataSource.getRepository(Genre);
  private castRepo = AppDataSource.getRepository(Cast);
  private imageRepo = AppDataSource.getRepository(Image);

  async addMovie(body: MovieType, posterUrl: string, photoUrls: string[]) {
    const {
      title,
      description,
      duration,
      language,
      subtitle,
      releaseDate,
      trailerId,
      experience,
      genres,
      casts,
    } = body;

    const existingMovie = await this.movieRepo.findOneBy({ title });

    if (existingMovie) {
      throw new Error("Movie already exists.");
    }
    // Fetch Genre entities by IDs
    const genreEntities =
      genres && genres.length ? await this.genreRepo.findByIds(genres) : [];

    for (const genre of genreEntities) {
      genre.movieCount = (genre.movieCount || 0) + 1;
    }
    await this.genreRepo.save(genreEntities);
    const castEntities =
      casts && casts.length ? await this.castRepo.findByIds(casts) : [];

    const posterImage = await this.imageRepo.save({ url: posterUrl });
    const photoImages = await Promise.all(
      photoUrls.map((url) =>
        this.imageRepo.save({
          url,
        }),
      ),
    );

    const newMovie = this.movieRepo.create({
      title,
      description,
      duration,
      language,
      subtitle,
      releaseDate,
      status: MovieStatus.comingSoon,
      poster: posterImage,
      trailerId,
      photos: photoImages,
      experience,
      genres: genreEntities,
      createdAt: new Date(),
      updatedAt: null,
      reviews: [],
      casts: castEntities,
    });

    await this.movieRepo.save(newMovie);
    return {
      status: 200,
      message: "Movie added successfully",
      data: newMovie,
    };
  }

  async updateMovie(
    movieId: number,
    body: Partial<MovieType>,
    posterUrl: string | null,
    photoUrls: string[],
  ) {
    const existingMovie = await this.movieRepo.findOne({
      where: { id: movieId },
      relations: ["genres"],
    });
    if (!existingMovie) {
      throw new Error("Movie not found.");
    }
    let genreEntities = existingMovie.genres;
    if (body.genres && body.genres.length > 0) {
      const existingGenreIds = existingMovie.genres.map((g) => g.id);
      const bodyGenreIds = body.genres.map(Number);
      genreEntities = (await this.genreRepo.findBy({
        id: In(body.genres),
      })) as Genre[];
      const newGenres = genreEntities.filter(
        (genre) => !existingGenreIds.includes(genre.id),
      );
      const removedGenres = existingMovie.genres.filter(
        (genre) => !bodyGenreIds.includes(genre.id),
      );

      if (newGenres.length || removedGenres.length) {
        await this.processGenreMovieCount(newGenres, removedGenres);
      }
    }

    let castEntities = existingMovie.casts;
    if (body.casts && body.casts.length > 0) {
      castEntities = (await this.castRepo.findBy({
        id: In(body.casts),
      })) as Cast[];
    }

    const posterImage =
      posterUrl && (await this.imageRepo.save({ url: posterUrl }));
    const photoImages =
      photoUrls?.length > 0 &&
      (await Promise.all(
        photoUrls.map((url) =>
          this.imageRepo.save({
            url,
          }),
        ),
      ));

    const updatedMovie = {
      ...existingMovie,
      ...body,
      poster: posterImage,
      photos: photoImages,
      // ...(posterImage ? { poster: posterImage } : {}),
      // ...(photoImages.length > 0 ? { photos: photoImages } : {}),
      genres: genreEntities,
      updatedAt: new Date(),
      casts: castEntities,
    };

    await this.movieRepo.save(updatedMovie);

    // DELETE OLD POSTER FILE IF NEW ONE IS UPLOADED
    if (posterUrl && existingMovie.poster?.url) {
      const oldPosterPath = path.join(
        __dirname,
        "..",
        "uploads",
        path.basename(existingMovie.poster.url),
      );
      try {
        await fs.unlink(oldPosterPath);
        console.log("Old poster deleted");
      } catch (err) {
        console.warn("Failed to delete old poster:", err);
      }
      await this.imageRepo.delete(existingMovie.poster.id);
    }

    // DELETE OLD GALLERY IMAGES IF NEW ONES ARE UPLOADED
    if (photoUrls.length > 0 && existingMovie.photos?.length) {
      for (const img of existingMovie.photos) {
        const oldPath = path.join(
          __dirname,
          "..",
          "uploads",
          path.basename(img.url),
        );
        try {
          await fs.unlink(oldPath);
        } catch (err) {
          console.warn("Failed to delete photo image:", err);
        }

        await this.imageRepo.delete(img.id);
      }
    }
    return {
      status: 200,
      message: "Movie updated successfully.",
    };
  }

  async deleteMovie(movieId: number) {
    const existingMovie = await this.movieRepo.findOne({
      where: { id: movieId },
      relations: ["genres"],
    });
    if (!existingMovie) {
      return {
        status: 404,
        message: "Movie not found",
      };
    }
    await this.processGenreMovieCount([], existingMovie.genres);
    await this.movieRepo.remove(existingMovie);

    // DELETE OLD POSTER FILE IF NEW ONE IS UPLOADED
    if (existingMovie.poster?.url) {
      const oldPosterPath = path.join(
        __dirname,
        "..",
        "uploads",
        path.basename(existingMovie.poster.url),
      );
      try {
        await fs.unlink(oldPosterPath);
        console.log("Old poster deleted");
      } catch (err) {
        console.warn("Failed to delete old poster:", err);
      }
      await this.imageRepo.delete(existingMovie.poster.id);
    }

    // DELETE OLD GALLERY IMAGES IF NEW ONES ARE UPLOADED
    if (existingMovie.photos?.length) {
      for (const img of existingMovie.photos) {
        const oldPath = path.join(
          __dirname,
          "..",
          "uploads",
          path.basename(img.url),
        );
        try {
          await fs.unlink(oldPath);
        } catch (err) {
          console.warn("Failed to delete photo image:", err);
        }

        await this.imageRepo.delete(img.id);
      }
    }
    return {
      status: 200,
      message: "Movie deleted successfully.",
    };
  }

  private async processGenreMovieCount(
    newGenres: GenreType[],
    removedGenres: GenreType[],
  ) {
    if (newGenres?.length > 0) {
      for (const genre of newGenres) {
        genre.movieCount = (genre.movieCount || 0) + 1;
      }
    }
    if (removedGenres?.length > 0) {
      for (const genre of removedGenres) {
        genre.movieCount = (genre.movieCount || 0) - 1;
      }
    }
    await this.genreRepo.save([...newGenres, ...removedGenres]);
  }
}
