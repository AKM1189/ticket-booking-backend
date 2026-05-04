"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieService = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../../data-source");
const Genre_1 = require("../../entity/Genre");
const Movie_1 = require("../../entity/Movie");
const MovieType_1 = require("../../types/MovieType");
const Cast_1 = require("../../entity/Cast");
const Image_1 = require("../../entity/Image");
const addNoti_1 = require("../../utils/addNoti");
const constants_1 = require("../../constants");
const cloudinaryUpload_1 = require("../../middlewares/cloudinaryUpload");
const dayjs_1 = __importDefault(require("dayjs"));
const AuthType_1 = require("../../types/AuthType");
class MovieService {
    movieRepo = data_source_1.AppDataSource.getRepository(Movie_1.Movie);
    genreRepo = data_source_1.AppDataSource.getRepository(Genre_1.Genre);
    castRepo = data_source_1.AppDataSource.getRepository(Cast_1.Cast);
    imageRepo = data_source_1.AppDataSource.getRepository(Image_1.Image);
    async getShowingMovies(user) {
        const today = (0, dayjs_1.default)().format("YYYY-MM-DD");
        const time = (0, dayjs_1.default)().format("HH:mm:ss");
        const movieQuery = data_source_1.AppDataSource.getRepository(Movie_1.Movie)
            .createQueryBuilder("movie")
            .innerJoin("movie.schedules", "schedule", "schedule.showDate = :today AND schedule.showTime >= :time OR schedule.showDate > :today", { today, time })
            .leftJoinAndSelect("movie.genres", "genres")
            .leftJoinAndSelect("movie.casts", "casts")
            .leftJoinAndSelect("movie.poster", "poster")
            .leftJoinAndSelect("movie.photos", "photos")
            .leftJoinAndSelect("movie.reviews", "reviews")
            .where("movie.status IN (:...statuses)", {
            statuses: [MovieType_1.MovieStatus.nowShowing, MovieType_1.MovieStatus.ticketAvailable],
        });
        if (user?.role === AuthType_1.Role.staff) {
            movieQuery.innerJoin("schedule.theatre", "theatre", "theatre.id = :theatreId", { theatreId: user.theatre.id });
        }
        return await movieQuery.getMany();
    }
    async addMovie(body, files, user) {
        const { title, description, duration, language, subtitle, releaseDate, trailerId, experience, genres, casts, } = body;
        const existingMovie = await this.movieRepo.findOneBy({ title });
        if (existingMovie) {
            throw new Error("Movie already exists.");
        }
        const uploadedKeys = [];
        try {
            const { posterImage, photoImages, uploadedUrls } = await this.uploadImages(files);
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
                status: MovieType_1.MovieStatus.comingSoon,
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
            (0, addNoti_1.addNotification)(constants_1.NOTI_TYPE.MOVIE_ADDED, "New Movie Added", `${user.name} added New Movie ${title} to the system.`, user.id);
            return {
                status: 200,
                message: "Movie added successfully",
                data: newMovie,
            };
        }
        catch (err) {
            await this.deleteImages(uploadedKeys);
            throw err;
        }
    }
    async updateMovie(movieId, body, files, user) {
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
                id: (0, typeorm_1.In)(body.genres),
            }));
            const added = genreEntities.filter((g) => !existingIds.includes(g.id));
            const removed = existingMovie.genres.filter((g) => !newIds.includes(g.id));
            if (added.length || removed.length) {
                await this.processGenreMovieCount(added, removed);
            }
        }
        let castEntities = existingMovie.casts;
        if (body.casts?.length) {
            castEntities = (await this.castRepo.findBy({
                id: (0, typeorm_1.In)(body.casts),
            }));
        }
        const uploadedKeys = [];
        try {
            const { posterImage, photoImages, uploadedUrls } = await this.uploadImages(files, existingMovie);
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
                await (0, cloudinaryUpload_1.deleteImage)(existingMovie.poster.url);
                await this.imageRepo.delete(existingMovie.poster.id);
            }
            // DELETE OLD PHOTOS
            if (photoImages !== existingMovie.photos &&
                existingMovie.photos?.length) {
                for (const img of existingMovie.photos) {
                    await (0, cloudinaryUpload_1.deleteImage)(img.url);
                    await this.imageRepo.delete(img.id);
                }
            }
            (0, addNoti_1.addNotification)(constants_1.NOTI_TYPE.MOVIE_UPDATED, "Movie Updated", `${user.name} updated Movie ${existingMovie.title} details.`, user.id);
            return {
                status: 200,
                message: "Movie updated successfully.",
            };
        }
        catch (err) {
            await this.deleteImages(uploadedKeys);
            throw err;
        }
    }
    async deleteMovie(movieId, user) {
        const movie = await this.movieRepo.findOne({
            where: { id: movieId },
            relations: ["poster", "photos", "genres"],
        });
        if (!movie) {
            throw new Error("Movie not found.");
        }
        const imageKeys = [];
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
            (0, addNoti_1.addNotification)(constants_1.NOTI_TYPE.MOVIE_DELETED, "Movie Deleted", `${user.name} deleted Movie ${movie.title} from the system.`, user.id);
            return {
                status: 200,
                message: "Movie deleted successfully.",
            };
        }
        catch (err) {
            throw err;
        }
    }
    async uploadImages(files, movie) {
        const uploadedUrls = [];
        let posterImage = movie?.poster ?? null;
        let photoImages = movie?.photos ?? [];
        const poster = files?.["poster"]?.[0];
        const photos = files?.["photos[]"] ?? [];
        // POSTER
        if (poster) {
            const posterKey = await (0, cloudinaryUpload_1.uploadImage)(poster);
            uploadedUrls.push(posterKey);
            posterImage = await this.imageRepo.save({
                url: posterKey,
            });
        }
        // GALLERY
        if (photos.length) {
            const keys = await Promise.all((photos ?? []).map((photo) => (0, cloudinaryUpload_1.uploadImage)(photo)));
            uploadedUrls.push(...keys);
            photoImages = await Promise.all((keys ?? []).map((key) => this.imageRepo.save({
                url: key,
            })));
        }
        return {
            posterImage,
            photoImages,
            uploadedUrls,
        };
    }
    async deleteImages(keys) {
        if (!keys?.length)
            return;
        await Promise.all(keys.filter(Boolean).map((key) => (0, cloudinaryUpload_1.deleteImage)(key)));
    }
    async processGenreMovieCount(newGenres, removedGenres) {
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
exports.MovieService = MovieService;
//# sourceMappingURL=movie.service.js.map