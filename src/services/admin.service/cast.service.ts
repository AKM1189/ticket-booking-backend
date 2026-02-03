import path from "path";
import { AppDataSource } from "../../data-source";
import { Cast } from "../../entity/Cast";
import { Image } from "../../entity/Image";
import { CastType } from "../../types/CastType";
import { promises as fs } from "fs";
import { Movie } from "../../entity/Movie";
import { String } from "aws-sdk/clients/cloudsearch";
import { Like } from "typeorm";
import { FilesType } from "../../types/ImageType";
import { deleteImage, uploadImage } from "../../middlewares/cloudinaryUpload";

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

  async addCast(body: CastType, files: FilesType) {
    const { name, role } = body;
    let publicKey: string | null = null;

    const existingCast = await this.castRepo.findOneBy({ name, role });
    if (existingCast) throw new Error("Cast already exists.");

    // Upload image if provided
    const imageFile = files?.["image"]?.[0];
    if (imageFile) {
      publicKey = await uploadImage(imageFile);
    }

    const castImage = publicKey
      ? await this.imageRepo.save({ url: publicKey })
      : null;

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

  async updateCast(castId: number, body: CastType, files: FilesType) {
    const { name, role } = body;

    const existingCast = await this.castRepo.findOneBy({ id: castId });
    if (!existingCast) return { status: 404, message: "Cast not found." };

    const duplicateCast = await this.castRepo.findOneBy({ name, role });
    if (duplicateCast && duplicateCast.id !== castId)
      return { status: 400, message: "Cast name already exists." };

    // Upload new image if provided
    const imageFile = files?.["image"]?.[0];
    let newCastImage = existingCast.image;

    if (imageFile) {
      const publicKey = await uploadImage(imageFile);
      newCastImage = await this.imageRepo.save({ url: publicKey });

      // Delete old image from Cloudinary + DB
      if (existingCast.image?.url) {
        await deleteImage(existingCast.image.url);
        await this.imageRepo.delete(existingCast.image.id);
      }
    }

    // Update cast entity
    Object.assign(existingCast, body);
    existingCast.image = newCastImage;
    await this.castRepo.save(existingCast);

    return { status: 200, message: "Cast updated successfully." };
  }

  async deleteCast(castId: number) {
    const cast = await this.castRepo.findOneBy({ id: castId });
    if (!cast) return { status: 404, message: "Cast not found" };

    // Prevent deletion if assigned to movies
    const movieWithCast = await this.movieRepo
      .createQueryBuilder("movie")
      .innerJoin("movie.casts", "cast", "cast.id = :castId", { castId })
      .getOne();

    if (movieWithCast)
      return {
        status: 400,
        message:
          "Cannot delete cast. It is already assigned to one or more movies.",
      };

    await this.castRepo.remove(cast);

    // Delete image from Cloudinary + DB
    if (cast.image?.url) {
      await deleteImage(cast.image.url);
      await this.imageRepo.delete(cast.image.id);
    }

    return { status: 200, message: "Cast deleted successfully." };
  }
}
