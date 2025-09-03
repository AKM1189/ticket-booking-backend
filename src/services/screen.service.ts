import { And, Like } from "typeorm";
import { AppDataSource } from "../data-source";
import { Genre } from "../entity/Genre";
import { Screen } from "../entity/Screen";
import { Theatre } from "../entity/Theatre";
import { GenreType } from "../types/GenreType";
import { ScreenType } from "../types/ScreenType";
import { SeatType } from "../entity/SeatType";
import { ScreenSeatType } from "../entity/ScreenSeatType";

export class ScreenService {
  private screenRepo = AppDataSource.getRepository(Screen);
  private theatreRepo = AppDataSource.getRepository(Theatre);
  private seatTypeRepo = AppDataSource.getRepository(SeatType);
  private screenSeatTypeRepo = AppDataSource.getRepository(ScreenSeatType);

  async getScreen(
    search: string,
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: string,
    filter: string,
  ) {
    let active = filter === "active";
    let whereClause: any = {};
    if (search && filter) {
      whereClause = [
        { active, name: Like(`%${search}%`) },
        { active, type: Like(`%${search}%`) },
        {
          active,
          theatre: { name: Like(`%${search}%`) },
        },
      ];
    } else if (filter) {
      whereClause = {
        active,
      };
    } else if (search) {
      whereClause = [
        { name: Like(`%${search}%`) },
        { type: Like(`%${search}%`) },
        {
          theatre: { name: Like(`%${search}%`) },
        },
      ];
    }

    const [screens, total] = await this.screenRepo.findAndCount({
      relations: ["theatre", "seatTypes.seatType"],
      order: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
      where: whereClause,
    });

    // Transform seatTypes id -> typeId
    const transformedScreens = screens.map((screen) => ({
      ...screen,
      multiplier: parseFloat(screen.multiplier.toString()),
    }));

    return {
      status: 200,
      data: transformedScreens,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getScreenByTheatre(theatreId: string) {
    const [screens] = await this.screenRepo.findAndCount({
      relations: ["theatre", "seatTypes.seatType"],
      where: { theatre: { id: parseInt(theatreId) } },
    });

    // Transform seatTypes id -> typeId
    const transformedScreens = screens.map((screen) => ({
      ...screen,
      multiplier: parseFloat(screen.multiplier.toString()),
    }));

    return {
      status: 200,
      data: transformedScreens,
    };
  }

  async getScreenByShow(theatreId: string, movieId: string) {
    const screens = await AppDataSource.getRepository(Screen)
      .createQueryBuilder("screen")
      .innerJoin("screen.schedules", "schedule")
      .innerJoin("schedule.theatre", "theatre")
      .innerJoin("schedule.movie", "movie")
      .where("movie.id = :movieId", { movieId })
      .andWhere("theatre.id = :theatreId", { theatreId })
      .leftJoinAndSelect("screen.seatTypes", "seatTypes")
      .leftJoinAndSelect("seatTypes.seatType", "seatType")
      // .distinct(true)
      .getMany();
    return {
      status: 200,
      data: screens,
    };
  }

  async addScreen(body: Omit<ScreenType, "id">) {
    const existingGenre = await this.screenRepo.findOneBy({ name: body.name });
    if (existingGenre) {
      throw new Error("Screen already exists.");
    }

    const theatreEntity = await this.theatreRepo.findOneBy({
      id: parseInt(body?.theatreId),
    });

    const newScreen = this.screenRepo.create({
      name: body.name,
      type: body.type,
      capacity: body.capacity,
      rows: body.rows,
      cols: body.cols,
      active: body.active,
      disabledSeats: body.disabledSeats,
      aisles: body.aisles,
      multiplier: body.multiplier,
      theatre: theatreEntity,
      createdAt: new Date(),
      updatedAt: null,
    });

    await this.screenRepo.save(newScreen);

    // Save seat types for this screen
    for (const st of body.seatTypes) {
      const seatTypeEntity = await this.seatTypeRepo.findOneBy({
        id: parseInt(st.typeId),
      });
      if (!seatTypeEntity) continue;

      const screenSeatType = this.screenSeatTypeRepo.create({
        screen: newScreen,
        seatType: seatTypeEntity,
        seatList: st.seatList,
      });

      await this.screenSeatTypeRepo.save(screenSeatType);
    }

    await this.theatreRepo.save({
      ...theatreEntity,
      totalScreens: theatreEntity.totalScreens + 1,
    });
    return {
      status: 200,
      message: "Screen added successfully",
      data: newScreen,
    };
  }

  async updateScreen(screenId: number, body: Omit<ScreenType, "id">) {
    const { name } = body;

    const existingScreenById = await this.screenRepo.findOne({
      relations: ["theatre"],
      where: { id: screenId },
    });
    if (!existingScreenById) {
      return {
        status: 404,
        message: "Screen not found.",
      };
    }

    const existingScreenByName = await this.screenRepo.findOneBy({ name });
    if (existingScreenByName && existingScreenByName.id !== screenId) {
      return {
        status: 400,
        message: "Screen name already exists.",
      };
    }

    const theatreEntity = await this.theatreRepo.findOne({
      relations: ["screens"],
      where: { id: parseInt(body?.theatreId) },
    });

    const updatedScreen = {
      ...existingScreenById,
      name: body.name,
      type: body.type,
      capacity: body.capacity,
      rows: body.rows,
      cols: body.cols,
      active: body.active,
      disabledSeats: body.disabledSeats,
      aisles: body.aisles,
      multiplier: body.multiplier,
      theatre: theatreEntity,
    };
    const saved = await this.screenRepo.save(updatedScreen);

    // Update totalScreens
    const oldTheatreId = existingScreenById.theatre?.id;
    const newTheatreId = theatreEntity.id;

    console.log("old", oldTheatreId);
    console.log("new", newTheatreId);

    // 1️⃣ Old theatre (if changed)
    if (oldTheatreId && oldTheatreId !== newTheatreId) {
      const oldTheatre = await this.theatreRepo.findOne({
        where: { id: oldTheatreId },
        relations: ["screens"],
      });
      if (oldTheatre) {
        oldTheatre.totalScreens = oldTheatre.screens.length;
        await this.theatreRepo.save(oldTheatre);
      }
    }

    // 2️⃣ New theatre
    const updatedTheatre = await this.theatreRepo.findOne({
      where: { id: newTheatreId },
      relations: ["screens"],
    });
    if (updatedTheatre) {
      updatedTheatre.totalScreens = updatedTheatre.screens.length;
      await this.theatreRepo.save(updatedTheatre);
    }

    // if (existingTheatre?.id !== theatreEntity?.id) {
    //   await this.theatreRepo.save({
    //     ...existingTheatre,
    //     totalScreens: existingTheatre.totalScreens - 1,
    //   });

    //   await this.theatreRepo.save({
    //     ...theatreEntity,
    //     totalScreens: theatreEntity.totalScreens + 1,
    //   });
    // }

    // Fetch existing rows for this screen
    const existingSeatTypes = await this.screenSeatTypeRepo.find({
      where: { screen: { id: screenId } },
      relations: ["seatType"],
    });

    // Build a map
    const seatTypeMap = new Map(
      existingSeatTypes.map((s) => [s.seatType.id, s]),
    );

    // Loop request seatTypes
    for (const st of body.seatTypes) {
      const typeId = parseInt(st.typeId);
      const seatList = st.seatList;

      if (seatTypeMap.has(typeId)) {
        // ✅ Update existing entity (has id)
        const existing = seatTypeMap.get(typeId);
        existing.seatList = seatList;
        await this.screenSeatTypeRepo.save(existing); // id exists
        seatTypeMap.delete(typeId);
      } else {
        // ✅ Create new entity
        const seatTypeEntity = await this.seatTypeRepo.findOneBy({
          id: typeId,
        });
        if (!seatTypeEntity) continue;

        const newSeatType = this.screenSeatTypeRepo.create({
          screen: updatedScreen, // proper entity
          seatType: seatTypeEntity,
          seatList,
        });
        await this.screenSeatTypeRepo.save(newSeatType); // now id is generated after save
      }
    }

    // Remove seat types not in request
    for (const remaining of seatTypeMap.values()) {
      await this.screenSeatTypeRepo.remove(remaining); // has id
    }

    return {
      status: 200,
      message: "Screen updated successfully.",
      data: saved,
    };
  }

  async deleteScreen(screenId: number) {
    const screen = await this.screenRepo.findOne({
      where: { id: screenId },
      relations: ["theatre"],
    });

    if (!screen) {
      return {
        status: 404,
        message: "Screen not found",
      };
    }

    const theatre = await this.theatreRepo.findOneBy({ id: screen.theatre.id });

    await this.theatreRepo.save({
      ...theatre,
      totalScreens: theatre?.totalScreens - 1,
    });

    await this.screenRepo.save({ ...screen, active: !screen.active });

    return {
      status: 200,
      message: `Screen ${
        screen.active ? "deactiveated" : "activated"
      } successfully.`,
    };
  }
}
