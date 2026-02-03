import { In } from "typeorm";
import { AppDataSource } from "../../data-source";
import { Genre } from "../../entity/Genre";
import { Movie } from "../../entity/Movie";
import { MovieStatus, MovieType } from "../../types/MovieType";
import { Cast } from "../../entity/Cast";
import { Image } from "../../entity/Image";
import { GenreType } from "../../types/GenreType";
import { addNotification } from "../../utils/addNoti";
import { NOTI_TYPE } from "../../constants";
import { User } from "../../entity/User";
import { FilesType } from "../../types/ImageType";
import { deleteImage, uploadImage } from "../../middlewares/cloudinaryUpload";
import dayjs from "dayjs";
import { Role } from "../../types/AuthType";

export class MovieService {
  private movieRepo = AppDataSource.getRepository(Movie);
  private genreRepo = AppDataSource.getRepository(Genre);
  private castRepo = AppDataSource.getRepository(Cast);
  private imageRepo = AppDataSource.getRepository(Image);

  async getShowingMovies(user: User) {
    const today = dayjs().format("YYYY-MM-DD");
    const time = dayjs().format("HH:mm:ss");

    const movieQuery = AppDataSource.getRepository(Movie)
      .createQueryBuilder("movie")
      .innerJoin(
        "movie.schedules",
        "schedule",
        "schedule.showDate = :today AND schedule.showTime >= :time OR schedule.showDate > :today",
        { today, time },
      )
      .leftJoinAndSelect("movie.genres", "genres")
      .leftJoinAndSelect("movie.casts", "casts")
      .leftJoinAndSelect("movie.poster", "poster")
      .leftJoinAndSelect("movie.photos", "photos")
      .leftJoinAndSelect("movie.reviews", "reviews")
      .where("movie.status IN (:...statuses)", {
        statuses: [MovieStatus.nowShowing, MovieStatus.ticketAvailable],
      });

    if (user?.role === Role.staff) {
      movieQuery.innerJoin(
        "schedule.theatre",
        "theatre",
        "theatre.id = :theatreId",
        { theatreId: user.theatre.id },
      );
    }

    return await movieQuery.getMany();
  }

  async addMovie(body: MovieType, files: FilesType, user: User) {
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

    const uploadedKeys: string[] = [];

    try {
      const { posterImage, photoImages, uploadedUrls } =
        await this.uploadImages(files);

      uploadedKeys.push(...uploadedUrls);

      const genreEntities = genres?.length
        ? await this.genreRepo.findByIds(genres)
        : [];

      for (const genre of genreEntities) {
        genre.movieCount = (genre.movieCount || 0) + 1;
      }
      await this.genreRepo.save(genreEntities);

      const castEntities = casts?.length
        ? await this.castRepo.findByIds(casts)
        : [];

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
        casts: castEntities,
        createdAt: new Date(),
        updatedAt: null,
        reviews: [],
      });

      await this.movieRepo.save(newMovie);

      addNotification(
        NOTI_TYPE.MOVIE_ADDED,
        "New Movie Added",
        `${user.name} added New Movie ${title} to the system.`,
        user.id,
      );

      return {
        status: 200,
        message: "Movie added successfully",
        data: newMovie,
      };
    } catch (err) {
      await this.deleteImages(uploadedKeys);
      throw err;
    }
  }

  async updateMovie(
    movieId: number,
    body: Partial<MovieType>,
    files: FilesType,
    user: User,
  ) {
    const existingMovie = await this.movieRepo.findOne({
      where: { id: movieId },
      relations: ["genres", "poster", "photos", "casts"],
    });

    if (!existingMovie) {
      throw new Error("Movie not found.");
    }

    let genreEntities = existingMovie.genres;
    if (body.genres?.length) {
      const existingIds = existingMovie.genres.map((g) => g.id);
      const newIds = body.genres.map(Number);

      genreEntities = (await this.genreRepo.findBy({
        id: In(body.genres),
      })) as Genre[];

      const added = genreEntities.filter((g) => !existingIds.includes(g.id));
      const removed = existingMovie.genres.filter(
        (g) => !newIds.includes(g.id),
      );

      if (added.length || removed.length) {
        await this.processGenreMovieCount(added, removed);
      }
    }

    let castEntities = existingMovie.casts;
    if (body.casts?.length) {
      castEntities = (await this.castRepo.findBy({
        id: In(body.casts),
      })) as Cast[];
    }

    const uploadedKeys: string[] = [];

    try {
      const { posterImage, photoImages, uploadedUrls } =
        await this.uploadImages(files, existingMovie);

      uploadedKeys.push(...uploadedUrls);
      const updatedMovie = {
        ...existingMovie,
        ...body,
        poster: posterImage,
        photos: photoImages,
        genres: genreEntities,
        casts: castEntities,
        updatedAt: new Date(),
      };

      await this.movieRepo.save(updatedMovie);

      // DELETE OLD POSTER
      if (posterImage && existingMovie.poster?.url) {
        await deleteImage(existingMovie.poster.url);
        await this.imageRepo.delete(existingMovie.poster.id);
      }

      // DELETE OLD PHOTOS
      if (
        photoImages !== existingMovie.photos &&
        existingMovie.photos?.length
      ) {
        for (const img of existingMovie.photos) {
          await deleteImage(img.url);
          await this.imageRepo.delete(img.id);
        }
      }

      addNotification(
        NOTI_TYPE.MOVIE_UPDATED,
        "Movie Updated",
        `${user.name} updated Movie ${existingMovie.title} details.`,
        user.id,
      );

      return {
        status: 200,
        message: "Movie updated successfully.",
      };
    } catch (err) {
      await this.deleteImages(uploadedKeys);
      throw err;
    }
  }

  async deleteMovie(movieId: number, user: User) {
    const movie = await this.movieRepo.findOne({
      where: { id: movieId },
      relations: ["poster", "photos", "genres"],
    });

    if (!movie) {
      throw new Error("Movie not found.");
    }

    const imageKeys: string[] = [];

    if (movie.poster?.url) {
      imageKeys.push(movie.poster.url);
    }

    if (movie.photos?.length) {
      imageKeys.push(...movie.photos.map((img) => img.url));
    }

    try {
      // UPDATE GENRE MOVIE COUNT
      if (movie.genres?.length) {
        for (const genre of movie.genres) {
          genre.movieCount = Math.max((genre.movieCount || 1) - 1, 0);
        }
        await this.genreRepo.save(movie.genres);
      }

      // DELETE MOVIE FIRST (DB integrity)
      await this.movieRepo.remove(movie);

      // DELETE IMAGE RECORDS
      if (movie.poster) {
        await this.imageRepo.delete(movie.poster.id);
      }

      if (movie.photos?.length) {
        await this.imageRepo.delete(movie.photos.map((img) => img.id));
      }

      // DELETE CLOUDINARY FILES
      await this.deleteImages(imageKeys);

      addNotification(
        NOTI_TYPE.MOVIE_DELETED,
        "Movie Deleted",
        `${user.name} deleted Movie ${movie.title} from the system.`,
        user.id,
      );

      return {
        status: 200,
        message: "Movie deleted successfully.",
      };
    } catch (err) {
      throw err;
    }
  }

  async uploadImages(files: FilesType, movie?: Movie) {
    const uploadedUrls: string[] = [];

    let posterImage = movie?.poster ?? null;
    let photoImages = movie?.photos ?? [];

    const poster = files?.["poster"]?.[0];
    const photos = files?.["photos[]"] ?? [];

    // POSTER
    if (poster) {
      const posterKey = await uploadImage(poster);
      uploadedUrls.push(posterKey);

      posterImage = await this.imageRepo.save({
        url: posterKey,
      });
    }

    // GALLERY
    if (photos.length) {
      const keys = await Promise.all(
        (photos ?? []).map((photo) => uploadImage(photo)),
      );

      uploadedUrls.push(...keys);

      photoImages = await Promise.all(
        (keys ?? []).map((key) =>
          this.imageRepo.save({
            url: key,
          }),
        ),
      );
    }

    return {
      posterImage,
      photoImages,
      uploadedUrls,
    };
  }

  async deleteImages(keys: string[]) {
    if (!keys?.length) return;

    await Promise.all(keys.filter(Boolean).map((key) => deleteImage(key)));
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
