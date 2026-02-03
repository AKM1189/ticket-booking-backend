import path from "path";
import { AppDataSource } from "../../data-source";
import { Cast } from "../../entity/Cast";
import { Image } from "../../entity/Image";
import { CastType } from "../../types/CastType";
import { promises as fs } from "fs";
import { Movie } from "../../entity/Movie";
import { String } from "aws-sdk/clients/cloudsearch";
import { Like } from "typeorm";
import { deleteFromR2 } from "../../config/r2-upload";

export class CastService {
  private castRepo = AppDataSource.getRepository(Cast);
  private imageRepo = AppDataSource.getRepository(Image);
  private movieRepo = AppDataSource.getRepository(Movie);

  async getCast(
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: string,
    search: String,
  ) {
    let whereClause: any = {};

    if (search) {
      whereClause = [
        { name: Like(`%${search}%`) },
        { role: Like(`%${search}%`) },
      ];
    }
    const [casts, total] = await this.castRepo.findAndCount({
      relations: ["image"],
      where: whereClause,
      order: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      status: 200,
      data: casts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllCast() {
    const casts = await this.castRepo.find({
      relations: ["image"],
    });

    return {
      status: 200,
      data: casts,
    };
  }

  async addCast(body: CastType, files: any, castImgUrl: string) {
    const { name, role } = body;

    const existingCast = await this.castRepo.findOneBy({ name, role });
    if (existingCast) {
      throw new Error("Cast already exists.");
    }
    const castImage = await this.imageRepo.save({ url: castImgUrl });

    const newCast = this.castRepo.create({
      name,
      role,
      image: castImage,
    });

    await this.castRepo.save(newCast);
    return {
      status: 200,
      message: "Cast added successfully",
      data: newCast,
    };
  }
  async updateCast(castId: number, body: CastType, castImgUrl: string) {
    const { name, role } = body;

    const existingCastById = await this.castRepo.findOne({
      where: { id: castId },
      relations: ['image']
    });
    if (!existingCastById) {
      return {
        status: 404,
        message: "Cast not found.",
      };
    }

    const existingCastByName = await this.castRepo.findOneBy({ name, role });
    if (existingCastByName && existingCastByName.id !== castId) {
      return {
        status: 400,
        message: "Cast name already exists.",
      };
    }

    // update cast table
    if (castImgUrl) {
      const castImage = await this.imageRepo.save({ url: castImgUrl });

       const updatedCast = {
        ...existingCastById,
        ...body,
        image: castImage,
      };
      await this.castRepo.save(updatedCast);

       deleteFromR2(existingCastById.image.url)
      await this.imageRepo.delete(existingCastById.image.id);


     
    } else {
      const updatedCast = {
        ...existingCastById,
        ...body,
      };
      await this.castRepo.save(updatedCast);
    }

    // // delete img from uploads folder and img table
    // if (castImgUrl && existingCastById.image?.url) {
    //   const oldPosterPath = path.join(
    //     __dirname,
    //     "..",
    //     "uploads",
    //     path.basename(existingCastById.image.url),
    //   );
    //   try {
    //     await fs.unlink(oldPosterPath);
    //     console.log("Old cast image deleted");
    //   } catch (err) {
    //     console.warn("Failed to delete old cast image:", err);
    //   }
    //   await this.imageRepo.delete(existingCastById.image.id);
    // }

    return {
      status: 200,
      message: "Cast updated successfully.",
    };
  }

  async deleteCast(castId: number) {
    const cast = await this.castRepo.findOne({
      where: { id: castId },
      relations: ['image']
    });

    if (!cast) {
      return {
        status: 404,
        message: "Cast not found",
      };
    }

    // Check if cast is linked to any movie
    const movieWithCast = await this.movieRepo
      .createQueryBuilder("movie")
      .innerJoin("movie.casts", "cast", "cast.id = :castId", { castId })
      .getOne();

    if (movieWithCast) {
      return {
        status: 400,
        message:
          "Cannot delete cast. It is already assigned to one or more movies.",
      };
    }

    await this.castRepo.remove(cast);

     deleteFromR2(cast.image.url)

    if (cast.image?.url) {
      const oldPosterPath = path.join(
        __dirname,
        "..",
        "uploads",
        path.basename(cast.image.url),
      );
      try {
        await fs.unlink(oldPosterPath);
        console.log("Old cast image deleted");
      } catch (err) {
        console.warn("Failed to delete old cast image:", err);
      }
      await this.imageRepo.delete(cast.image.id);
    }

    return {
      status: 200,
      message: "Cast deleted successfully.",
    };
  }
}
