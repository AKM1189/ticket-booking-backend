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
import { Screen } from "../../entity/Screen";

export class TheatreService {
  private theatreRepo = AppDataSource.getRepository(Theatre);
  private screenRepo = AppDataSource.getRepository(Screen);

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
    const { name, location, city } = body;

    const existingLocation = await this.theatreRepo.findOneBy({
      location,
      city,
    });
    if (existingLocation) {
      throw new Error("Branch location already exists.");
    }

    const newTheatre = this.theatreRepo.create({
      ...body,
      totalScreens: 0,
      active: true,
    });

    const theatre = await this.theatreRepo.save(newTheatre);

    const message = `${user.name} added ${theatre.location} branch.`;

    addNotification(
      NOTI_TYPE.THEATRE_ADDED,
      "Theatre Added",
      message,
      user.id,
      theatre?.id,
    );

    return {
      status: 200,
      message: "Branch added successfully",
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

    const existingTheatreByLocation = await this.theatreRepo.findOneBy({
      location,
    });
    if (
      existingTheatreByLocation &&
      existingTheatreByLocation.id !== TheatreId
    ) {
      return {
        status: 400,
        message: "Branch location already exists.",
      };
    }

    const updatedTheatre = { ...existingTheatreById, ...body };
    const saved = await this.theatreRepo.save(updatedTheatre);

    const message = `${user.name} updated ${saved.name} branch details.`;

    addNotification(
      NOTI_TYPE.THEATRE_UPDATED,
      "Theatre Updated",
      message,
      user.id,
      existingTheatreById?.id,
    );

    return {
      status: 200,
      message: "Branch updated successfully.",
      data: saved,
    };
  }

  async deleteTheatre(theatreId: number, user: User) {
    const theatre = await this.theatreRepo.findOneBy({ id: theatreId });
    const status = theatre.active;
    if (!theatre) {
      return {
        status: 404,
        message: "Branch not found",
      };
    }

    await this.theatreRepo.save({ ...theatre, active: !theatre.active });
    const screens = await this.screenRepo.find({
      relations: ["theatre"],
      where: { theatre: { id: theatreId } },
    });

    screens.map((screen) => {
      screen.active = !status;
      this.screenRepo.save(screen);
    });

    const message = `${user.name} ${
      status === true ? "deactivated" : "activated"
    } ${theatre.location} branch and its screens.`;

    addNotification(
      theatre.active
        ? NOTI_TYPE.THEATRE_DEACTIVATED
        : NOTI_TYPE.THEATRE_ACTIVATED,
      `Branch ${theatre.active ? "Deactivated" : "Activated"}`,
      message,
      user.id,
      theatre?.id,
    );

    return {
      status: 200,
      message: `Branch and its screens ${
        theatre.active ? "deactiveated" : "activated"
      } successfully.`,
    };
  }
}
