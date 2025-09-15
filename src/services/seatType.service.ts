import { AppDataSource } from "../data-source";
import { Genre } from "../entity/Genre";
import { SeatType } from "../entity/SeatType";
import { GenreType } from "../types/GenreType";
import { SeatTypeType } from "../types/SeatType";

export class SeatTypeService {
  private seatTypeRepo = AppDataSource.getRepository(SeatType);

  async getSeatTypes(
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: string,
  ) {
    const [seatTypes, total] = await this.seatTypeRepo.findAndCount({
      relations: ["screens"],
      order: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      status: 200,
      data: seatTypes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async addSeatType(body: SeatTypeType) {
    const { name, price } = body;

    const existingType = await this.seatTypeRepo.findOneBy({ name });
    if (existingType) {
      throw new Error("Seat Type already exists.");
    }

    const newType = this.seatTypeRepo.create({
      name,
      price,
    });

    await this.seatTypeRepo.save(newType);
    return {
      status: 200,
      message: "Seat Type added successfully",
      data: newType,
    };
  }
  async updateSeatType(typeId: number, body: GenreType) {
    const { name } = body;

    const existingTypeById = await this.seatTypeRepo.findOneBy({
      id: typeId,
    });
    if (!existingTypeById) {
      return {
        status: 404,
        message: "Seat Type not found.",
      };
    }

    const existingTypeByName = await this.seatTypeRepo.findOneBy({ name });
    if (existingTypeByName && existingTypeByName.id !== typeId) {
      return {
        status: 400,
        message: "Seat Type name already exists.",
      };
    }

    const updatedType = { ...existingTypeById, ...body };
    const saved = await this.seatTypeRepo.save(updatedType);

    return {
      status: 200,
      message: "Seat Type updated successfully.",
      data: saved,
    };
  }

  async deleteSeatType(typeId: number) {
    const seatType = await this.seatTypeRepo.findOneBy({ id: typeId });

    if (!seatType) {
      return {
        status: 404,
        message: "Seat Type not found",
      };
    }
    await this.seatTypeRepo.remove(seatType);
    return {
      status: 200,
      message: "Seat Type deleted successfully.",
    };
  }
}
