import { In } from "typeorm";
import { AppDataSource } from "../../data-source";
import { Genre } from "../../entity/Genre";
import { Movie } from "../../entity/Movie";
import { MovieStatus, MovieType } from "../../types/MovieType";
import { Cast } from "../../entity/Cast";
import { CastType } from "../../types/CastType";
import { Image } from "../../entity/Image";
import axios from "axios";
import path from "path";
import { promises as fs } from "fs";
import { GenreType } from "../../types/GenreType";
import { addNotification } from "../../utils/addNoti";
import { NOTI_TYPE } from "../../constants";
import { User } from "../../entity/User";
import { deleteFromR2 } from "../../config/r2-upload";
import { Express } from "express";
import { ImageService } from "../image.service/image.service";

type FilesType =
  | Express.Multer.File[]
  | {
      [fieldname: string]: Express.Multer.File[];
    };

export class MovieService {
  private movieRepo = AppDataSource.getRepository(Movie);
  private genreRepo = AppDataSource.getRepository(Genre);
  private castRepo = AppDataSource.getRepository(Cast);
  private imageRepo = AppDataSource.getRepository(Image);
  private imageService = new ImageService();
  // constructor(private imageService: ImageService) {}

  async addMovie(body: MovieType, files: FilesType, user: User) {
    const imageFiles = files as {
      poster?: Express.Multer.File[];
      "photos[]": Express.Multer.File[];
    };

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

    const posterUrl = await this.imageService.uploadOne(
      imageFiles.poster[0],
      "movies",
    );
    const photoUrls = await this.imageService.uploadMany(
      imageFiles["photos[]"],
      "movies",
    );

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
      rating: 0,
      photos: photoImages,
      experience,
      genres: genreEntities,
      createdAt: new Date(),
      updatedAt: null,
      reviews: [],
      casts: castEntities,
    });

    await this.movieRepo.save(newMovie);

    const message = `${user.name} added New Movie ${title} to the system.`;
    addNotification(
      NOTI_TYPE.MOVIE_ADDED,
      "New Movie Added",
      message,
      user?.id,
    );

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
    user: User,
  ) {
    let posterImage: Image;
    let photoImages: Image[];
    const movie = await this.movieRepo.findOne({
      where: { id: movieId },
      relations: ["genres"],
    });
    if (!movie) {
      throw new Error("Movie not found.");
    }
    let genreEntities = movie.genres;
    if (body.genres && body.genres.length > 0) {
      const existingGenreIds = movie.genres.map((g) => g.id);
      const bodyGenreIds = body.genres.map(Number);
      genreEntities = (await this.genreRepo.findBy({
        id: In(body.genres),
      })) as Genre[];
      const newGenres = genreEntities.filter(
        (genre) => !existingGenreIds.includes(genre.id),
      );
      const removedGenres = movie.genres.filter(
        (genre) => !bodyGenreIds.includes(genre.id),
      );

      if (newGenres.length || removedGenres.length) {
        await this.processGenreMovieCount(newGenres, removedGenres);
      }
    }

    let castEntities = movie.casts;
    if (body.casts && body.casts.length > 0) {
      castEntities = (await this.castRepo.findBy({
        id: In(body.casts),
      })) as Cast[];
    }

    if (posterUrl) {
      deleteFromR2(movie.poster.url);
      posterImage = await this.imageRepo.save({ url: posterUrl });
      await this.imageRepo.delete(movie.poster.id);
    }

    if (photoUrls && photoUrls.length > 0) {
      movie.photos.map(async (item) => {
        await deleteFromR2(item.url);
        await this.imageRepo.delete(item.id);
      });
      photoImages = await Promise.all(
        photoUrls.map((url) =>
          this.imageRepo.save({
            url,
          }),
        ),
      );
    }

    const updatedMovie = {
      ...movie,
      ...body,
      poster: posterImage,
      photos: photoImages,
      genres: genreEntities,
      updatedAt: new Date(),
      casts: castEntities,
    };

    await this.movieRepo.save(updatedMovie);

    // // DELETE OLD POSTER FILE IF NEW ONE IS UPLOADED
    // if (posterUrl && movie.poster?.url) {
    //   const oldPosterPath = path.join(
    //     __dirname,
    //     "..",
    //     "uploads",
    //     path.basename(movie.poster.url),
    //   );
    //   try {
    //     await fs.unlink(oldPosterPath);
    //     console.log("Old poster deleted");
    //   } catch (err) {
    //     console.warn("Failed to delete old poster:", err);
    //   }
    //   await this.imageRepo.delete(movie.poster.id);
    // }

    // // DELETE OLD GALLERY IMAGES IF NEW ONES ARE UPLOADED
    // if (photoUrls.length > 0 && movie.photos?.length) {
    //   for (const img of movie.photos) {
    //     const oldPath = path.join(
    //       __dirname,
    //       "..",
    //       "uploads",
    //       path.basename(img.url),
    //     );
    //     try {
    //       await fs.unlink(oldPath);
    //     } catch (err) {
    //       console.warn("Failed to delete photo image:", err);
    //     }

    //     await this.imageRepo.delete(img.id);
    //   }
    // }

    const message = `${user.name} updated Movie ${movie.title} details.`;
    addNotification(NOTI_TYPE.MOVIE_UPDATED, "Movie Updated", message, user.id);

    return {
      status: 200,
      message: "Movie updated successfully.",
    };
  }

  async deleteMovie(movieId: number, user: User) {
    const existingMovie = await this.movieRepo.findOne({
      where: { id: movieId },
      relations: ["genres", "schedules"],
    });
    if (!existingMovie) {
      return {
        status: 404,
        message: "Movie not found",
      };
    }

    if (existingMovie.schedules?.length > 0) {
      throw new Error("Delete all schedules for this movie first.");
    }
    await this.processGenreMovieCount([], existingMovie.genres);
    await this.movieRepo.remove(existingMovie);

    await deleteFromR2(existingMovie.poster.url);
    await this.imageRepo.delete(existingMovie.poster.id);

    existingMovie.photos.map(async (item) => {
      await deleteFromR2(item.url);
      await this.imageRepo.delete(item.id);
    });

    // DELETE OLD POSTER FILE IF NEW ONE IS UPLOADED
    // if (existingMovie.poster?.url) {
    //   const oldPosterPath = path.join(
    //     __dirname,
    //     "..",
    //     "uploads",
    //     path.basename(existingMovie.poster.url),
    //   );
    //   try {
    //     await fs.unlink(oldPosterPath);
    //     console.log("Old poster deleted");
    //   } catch (err) {
    //     console.warn("Failed to delete old poster:", err);
    //   }
    //   await this.imageRepo.delete(existingMovie.poster.id);
    // }

    // DELETE OLD GALLERY IMAGES IF NEW ONES ARE UPLOADED
    // if (existingMovie.photos?.length) {
    //   for (const img of existingMovie.photos) {
    //     const oldPath = path.join(
    //       __dirname,
    //       "..",
    //       "uploads",
    //       path.basename(img.url),
    //     );
    //     try {
    //       await fs.unlink(oldPath);
    //     } catch (err) {
    //       console.warn("Failed to delete photo image:", err);
    //     }

    //     await this.imageRepo.delete(img.id);
    //   }
    // }

    const message = `${user.name} deleted Movie ${existingMovie.title} from the system.`;
    addNotification(NOTI_TYPE.MOVIE_DELETED, "Movie Deleted", message, user.id);

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
        genre.movieCount = Math.max((genre.movieCount || 0) - 1, 0);
      }
    }
    await this.genreRepo.save([...newGenres, ...removedGenres]);
  }
}
