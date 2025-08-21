import { Like } from "typeorm";
import { AppDataSource } from "../data-source";
import { Genre } from "../entity/Genre";
import { Theatre } from "../entity/Theatre";
import { GenreType } from "../types/GenreType";
import { TheatreInputType } from "../types/TheatreType";

export class TheatreService {
  private theatreRepo = AppDataSource.getRepository(Theatre);

  async getTheatres(
    filter: string,
    search: string,
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: string,
  ) {
    let active = filter === "active";
    let whereClause: any = {};
    if (filter && search) {
      whereClause = [
        { active, name: Like(`%${search}%`) },
        { active, location: Like(`%${search}%`) },
        { active, region: Like(`%${search}%`) },
        { active, city: Like(`%${search}%`) },
        { active, phoneNo: Like(`%${search}%`) },
      ];
    } else if (filter) {
      whereClause = {
        active,
      };
    } else if (search) {
      whereClause = [
        { name: Like(`%${search}%`) },
        { location: Like(`%${search}%`) },
        { region: Like(`%${search}%`) },
        { city: Like(`%${search}%`) },
        { phoneNo: Like(`%${search}%`) },
      ];
    }
    const [genres, total] = await this.theatreRepo.findAndCount({
      order: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
      where: whereClause,
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

  async addTheatre(body: TheatreInputType) {
    const { name, location } = body;

    const existingName = await this.theatreRepo.findOneBy({ name });
    if (existingName) {
      throw new Error("Theatre name already exists.");
    }

    const existingLocation = await this.theatreRepo.findOneBy({ location });
    if (existingLocation) {
      throw new Error("Theatre location already exists.");
    }

    const newTheatre = this.theatreRepo.create({
      ...body,
      totalScreens: 0,
      active: true,
    });

    await this.theatreRepo.save(newTheatre);
    return {
      status: 200,
      message: "Theatre added successfully",
      data: newTheatre,
    };
  }
  async updateTheatre(TheatreId: number, body: TheatreInputType) {
    const { name, location } = body;

    const existingTheatreById = await this.theatreRepo.findOneBy({
      id: TheatreId,
    });
    if (!existingTheatreById) {
      return {
        status: 404,
        message: "Theatre not found.",
      };
    }

    const existingTheatreByName = await this.theatreRepo.findOneBy({ name });
    if (existingTheatreByName && existingTheatreByName.id !== TheatreId) {
      return {
        status: 400,
        message: "Theatre name already exists.",
      };
    }
    const existingTheatreByLocation = await this.theatreRepo.findOneBy({
      location,
    });
    if (
      existingTheatreByLocation &&
      existingTheatreByLocation.id !== TheatreId
    ) {
      return {
        status: 400,
        message: "Theatre location already exists.",
      };
    }

    const updatedTheatre = { ...existingTheatreById, ...body };
    const saved = await this.theatreRepo.save(updatedTheatre);

    return {
      status: 200,
      message: "Theatre updated successfully.",
      data: saved,
    };
  }

  async deleteTheatre(theatreId: number) {
    const theatre = await this.theatreRepo.findOneBy({ id: theatreId });

    if (!theatre) {
      return {
        status: 404,
        message: "Theatre not found",
      };
    }

    await this.theatreRepo.save({ ...theatre, active: !theatre.active });
    return {
      status: 200,
      message: `Theatre ${
        theatre.active ? "deactiveated" : "activated"
      } successfully.`,
    };
  }
}
