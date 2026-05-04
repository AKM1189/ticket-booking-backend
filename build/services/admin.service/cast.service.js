"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CastService = void 0;
const data_source_1 = require("../../data-source");
const Cast_1 = require("../../entity/Cast");
const Image_1 = require("../../entity/Image");
const Movie_1 = require("../../entity/Movie");
const typeorm_1 = require("typeorm");
const cloudinaryUpload_1 = require("../../middlewares/cloudinaryUpload");
class CastService {
    castRepo = data_source_1.AppDataSource.getRepository(Cast_1.Cast);
    imageRepo = data_source_1.AppDataSource.getRepository(Image_1.Image);
    movieRepo = data_source_1.AppDataSource.getRepository(Movie_1.Movie);
    async getCast(page, limit, sortBy, sortOrder, search) {
        let whereClause = {};
        if (search) {
            whereClause = [
                { name: (0, typeorm_1.Like)(`%${search}%`) },
                { role: (0, typeorm_1.Like)(`%${search}%`) },
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
    async addCast(body, files) {
        const { name, role } = body;
        let publicKey = null;
        const existingCast = await this.castRepo.findOneBy({ name, role });
        if (existingCast)
            throw new Error("Cast already exists.");
        // Upload image if provided
        const imageFile = files?.["image"]?.[0];
        if (imageFile) {
            publicKey = await (0, cloudinaryUpload_1.uploadImage)(imageFile);
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
    async updateCast(castId, body, files) {
        const { name, role } = body;
        const existingCast = await this.castRepo.findOneBy({ id: castId });
        if (!existingCast)
            return { status: 404, message: "Cast not found." };
        const duplicateCast = await this.castRepo.findOneBy({ name, role });
        if (duplicateCast && duplicateCast.id !== castId)
            return { status: 400, message: "Cast name already exists." };
        // Upload new image if provided
        const imageFile = files?.["image"]?.[0];
        let newCastImage = existingCast.image;
        if (imageFile) {
            const publicKey = await (0, cloudinaryUpload_1.uploadImage)(imageFile);
            newCastImage = await this.imageRepo.save({ url: publicKey });
            // Delete old image from Cloudinary + DB
            if (existingCast.image?.url) {
                await (0, cloudinaryUpload_1.deleteImage)(existingCast.image.url);
                await this.imageRepo.delete(existingCast.image.id);
            }
        }
        // Update cast entity
        Object.assign(existingCast, body);
        existingCast.image = newCastImage;
        await this.castRepo.save(existingCast);
        return { status: 200, message: "Cast updated successfully." };
    }
    async deleteCast(castId) {
        const cast = await this.castRepo.findOneBy({ id: castId });
        if (!cast)
            return { status: 404, message: "Cast not found" };
        // Prevent deletion if assigned to movies
        const movieWithCast = await this.movieRepo
            .createQueryBuilder("movie")
            .innerJoin("movie.casts", "cast", "cast.id = :castId", { castId })
            .getOne();
        if (movieWithCast)
            return {
                status: 400,
                message: "Cannot delete cast. It is already assigned to one or more movies.",
            };
        await this.castRepo.remove(cast);
        // Delete image from Cloudinary + DB
        if (cast.image?.url) {
            await (0, cloudinaryUpload_1.deleteImage)(cast.image.url);
            await this.imageRepo.delete(cast.image.id);
        }
        return { status: 200, message: "Cast deleted successfully." };
    }
}
exports.CastService = CastService;
//# sourceMappingURL=cast.service.js.map