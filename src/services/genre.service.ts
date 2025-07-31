import { AppDataSource } from "../data-source";
import { Genre } from "../entity/Genre";
import { GenreType } from "../types/GenreType";

export class GenreService {
  private genreRepo = AppDataSource.getRepository(Genre);

  async getGenre(
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: string,
  ) {
    const [genres, total] = await this.genreRepo.findAndCount({
      order: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      status: 200,
      data: genres,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async addGenre(body: GenreType) {
    const { name, description, color } = body;

    const existingGenre = await this.genreRepo.findOneBy({ name });
    if (existingGenre) {
      throw new Error("Genre already exists.");
    }

    const newGenre = this.genreRepo.create({
      name,
      description,
      movieCount: 0,
      color,
    });

    await this.genreRepo.save(newGenre);
    return {
      status: 200,
      message: "Genre added successfully",
      data: newGenre,
    };
  }
  async updateGenre(genreId: number, body: GenreType) {
    const { name } = body;

    const existingGenreById = await this.genreRepo.findOneBy({ id: genreId });
    if (!existingGenreById) {
      return {
        status: 404,
        message: "Genre not found.",
      };
    }

    const existingGenreByName = await this.genreRepo.findOneBy({ name });
    console.log("existing genre", existingGenreByName);
    if (existingGenreByName && existingGenreByName.id !== genreId) {
      return {
        status: 400,
        message: "Genre name already exists.",
      };
    }

    const updatedGenre = this.genreRepo.merge(existingGenreById, { ...body });
    const saved = await this.genreRepo.save(updatedGenre);

    return {
      status: 200,
      message: "Genre updated successfully.",
      data: saved,
    };
  }

  async deleteGenre(genreId: number) {
    const genre = await this.genreRepo.findOneBy({ id: genreId });

    if (!genre) {
      return {
        status: 404,
        message: "Genre not found",
      };
    }
    await this.genreRepo.remove(genre);
    return {
      status: 200,
      message: "Genre deleted successfully.",
    };
  }
}
