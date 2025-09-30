import { Like } from "typeorm";
import { AppDataSource } from "../../data-source";
import { Genre } from "../../entity/Genre";
import { Theatre } from "../../entity/Theatre";
import { GenreType } from "../../types/GenreType";
import { TheatreInputType } from "../../types/TheatreType";
import dayjs from "dayjs";
import { User } from "../../entity/User";
import { addNotification } from "../../utils/addNoti";
import { NOTI_TYPE } from "../../constants";

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
    const [theatres, total] = await this.theatreRepo.findAndCount({
      relations: ["screens", "schedules"],
      order: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
      where: whereClause,
    });

    return {
      status: 200,
      data: theatres,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTheatresByShowingMovie(movieId: string) {
    const today = dayjs().format("YYYY-MM-DD");
    const time = dayjs().format("HH:mm:ss");
    const theatres = await AppDataSource.getRepository(Theatre)
      .createQueryBuilder("theatre")
      .innerJoin("theatre.schedules", "schedule")
      .innerJoin("schedule.movie", "movie")
      .where("movie.id = :movieId", { movieId })
      .andWhere(
        `((schedule.showDate = :today AND schedule.showTime >= :time) OR (schedule.showDate > :today))`,
        { today, time },
      )
      .andWhere("theatre.active = 1")
      .distinct(true)
      .getMany();

    return {
      status: 200,
      data: theatres,
    };
  }

  async addTheatre(body: TheatreInputType, user: User) {
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

    const theatre = await this.theatreRepo.save(newTheatre);

    const message = `${user.name} added ${theatre.name} theatre.`;

    addNotification(
      NOTI_TYPE.THEATRE_ADDED,
      "Theatre Added",
      message,
      user.id,
      theatre?.id,
    );

    return {
      status: 200,
      message: "Theatre added successfully",
      data: newTheatre,
    };
  }
  async updateTheatre(TheatreId: number, body: TheatreInputType, user: User) {
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

    const message = `${user.name} updated ${saved.name} theatre details.`;

    addNotification(
      NOTI_TYPE.THEATRE_UPDATED,
      "Theatre Updated",
      message,
      user.id,
      existingTheatreById?.id,
    );

    return {
      status: 200,
      message: "Theatre updated successfully.",
      data: saved,
    };
  }

  async deleteTheatre(theatreId: number, user: User) {
    const theatre = await this.theatreRepo.findOneBy({ id: theatreId });

    if (!theatre) {
      return {
        status: 404,
        message: "Theatre not found",
      };
    }

    await this.theatreRepo.save({ ...theatre, active: !theatre.active });

    const message = `${user.name} updated ${theatre.name} theatre details.`;

    addNotification(
      theatre.active
        ? NOTI_TYPE.THEATRE_DEACTIVATED
        : NOTI_TYPE.THEATRE_ACTIVATED,
      `Theatre ${theatre.active ? "Deactivated" : "Activated"}`,
      message,
      user.id,
      theatre?.id,
    );

    return {
      status: 200,
      message: `Theatre ${
        theatre.active ? "deactiveated" : "activated"
      } successfully.`,
    };
  }
}
