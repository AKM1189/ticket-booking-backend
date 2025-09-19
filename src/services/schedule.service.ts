import dayjs from "dayjs";
import { AppDataSource } from "../data-source";
import { Movie } from "../entity/Movie";
import { Schedule } from "../entity/Schedule";
import { Screen } from "../entity/Screen";
import { Theatre } from "../entity/Theatre";
import {
  ScheduleBodyType,
  ScheduleStatus,
  ScheduleType,
} from "../types/ScheduleType";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { SeatType } from "../entity/SeatType";
import { ScheduleSeatType } from "../entity/ScheduleSeatType";
import { updateMovieStatus } from "../utils/updateMovieStatus";
import { updateMovie } from "../utils/updateStatus";
import { Like } from "typeorm";
import { addNotification } from "../utils/addNoti";
import { NOTI_TYPE } from "../constants";
import { User } from "../entity/User";
import { Role } from "../types/AuthType";

dayjs.extend(utc);
dayjs.extend(timezone);

let date = dayjs.utc();

export class ScheduleService {
  private scheduleRepo = AppDataSource.getRepository(Schedule);
  private movieRepo = AppDataSource.getRepository(Movie);
  private theatreRepo = AppDataSource.getRepository(Theatre);
  private screenRepo = AppDataSource.getRepository(Screen);
  private seatTypeRepo = AppDataSource.getRepository(SeatType);
  private scheduleSeatTypeRepo = AppDataSource.getRepository(ScheduleSeatType);

  async getSchedule(
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: string,
    search: string,
    date: string,
    user: User,
  ) {
    let whereClause: any = {};

    if (user.role === Role.staff) {
      const theatre = { id: user.theatre?.id };
      if (search && date) {
        whereClause = [
          { showDate: date, movie: { title: Like(`%${search}%`) } },
          { theatre, showDate: date, screen: { name: Like(`%${search}%`) } },
          { theatre, showDate: date, showTime: Like(`%${search}%`) },
          { theatre, showDate: date, status: Like(`%${search}%`) },
        ];
      } else if (search) {
        whereClause = [
          { theatre, movie: { title: Like(`%${search}%`) } },
          { theatre, screen: { name: Like(`%${search}%`) } },
          { theatre, showTime: Like(`%${search}%`) },
          { theatre, status: Like(`%${search}%`) },
        ];
      } else {
        whereClause = { theatre, showDate: date };
      }
    }

    if (user.role === Role.admin) {
      if (search && date) {
        whereClause = [
          { showDate: date, movie: { title: Like(`%${search}%`) } },
          { showDate: date, theatre: { name: Like(`%${search}%`) } },
          { showDate: date, screen: { name: Like(`%${search}%`) } },
          { showDate: date, showTime: Like(`%${search}%`) },
          { showDate: date, status: Like(`%${search}%`) },
        ];
      } else if (search) {
        whereClause = [
          { movie: { title: Like(`%${search}%`) } },
          { theatre: { name: Like(`%${search}%`) } },
          { screen: { name: Like(`%${search}%`) } },
          { showTime: Like(`%${search}%`) },
          { status: Like(`%${search}%`) },
        ];
      } else {
        whereClause = { showDate: date };
      }
    }

    const [schedules, total] = await this.scheduleRepo.findAndCount({
      relations: [
        "movie",
        "theatre",
        "screen",
        "seatTypes",
        "screen.seatTypes.seatType",
      ],
      order: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
      where: whereClause,
    });

    const seatTypes = await this.seatTypeRepo.find();

    const formattedSchedules = schedules.map((schedule) => {
      const seatTypeList = seatTypes.map((item) => {
        const price =
          item.price * schedule.multiplier * schedule.screen.multiplier;
        return {
          ...item,
          price: parseFloat(price.toString()).toFixed(2),
        };
      });
      return {
        ...schedule,
        showTime: schedule.showTime.slice(0, 5),
        priceList: seatTypeList,
      };
    });

    return {
      status: 200,
      data: formattedSchedules,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getScheduleByShowDetail(
    movieId: string,
    theatreId: string,
    screenId: string,
    showDate: string,
    showTime: string,
  ) {
    const today = dayjs().format("YYYY-MM-DD");
    const time = dayjs().format("HH:mm:ss");

    const schedules = await AppDataSource.getRepository(Schedule)
      .createQueryBuilder("schedule")
      .where("schedule.movieId = :movieId", { movieId })
      .andWhere("schedule.theatreId = :theatreId", { theatreId })
      .andWhere("schedule.screenId = :screenId", { screenId })
      .andWhere("schedule.showDate = :showDate", { showDate })
      .andWhere("schedule.showTime = :showTime", { showTime })
      .andWhere("schedule.status != :status", {
        status: ScheduleStatus.inActive,
      })
      .getMany();

    const screen = await this.screenRepo.findOne({
      where: { id: parseInt(screenId) },
    });
    const seatTypes = await this.seatTypeRepo.find();

    const seatTypeList = seatTypes.map((item) => {
      const price = item.price * schedules[0]?.multiplier * screen?.multiplier;
      return {
        ...item,
        price: parseFloat(price.toString()).toFixed(2),
      };
    });

    const updatedSchedule = {
      ...schedules[0],
      priceList: seatTypeList,
    };
    return {
      status: 200,
      data: updatedSchedule,
    };
  }

  async getShowDate(movieId: string, theatreId: string, screenId: string) {
    const today = dayjs().format("YYYY-MM-DD");
    const time = dayjs().format("HH:mm:ss");
    const showDates = await AppDataSource.getRepository(Schedule)
      .createQueryBuilder("schedule")
      .select("DISTINCT schedule.showDate", "showDate")
      .where("schedule.movieId = :movieId", { movieId })
      .andWhere("schedule.theatreId = :theatreId", { theatreId })
      .andWhere("schedule.screenId = :screenId", { screenId })
      .andWhere("schedule.status NOT IN (:...statuses)", {
        statuses: [ScheduleStatus.inActive, ScheduleStatus.completed],
      })
      .andWhere(
        `((schedule.showDate = :today AND schedule.showTime >= :time) OR (schedule.showDate > :today))`,
        { today, time },
      )
      .getRawMany();

    const formattedShowDates = showDates.map((date) =>
      dayjs(date.showDate).tz("Asia/Yangon").format("DD-MM-YYYY"),
    );

    return {
      status: 200,
      data: formattedShowDates,
    };
  }

  async getShowTime(
    movieId: string,
    theatreId: string,
    screenId: string,
    showDate: string,
  ) {
    const today = dayjs().format("YYYY-MM-DD");
    const time = dayjs().format("HH:mm:ss");

    const showTimes = await AppDataSource.getRepository(Schedule)
      .createQueryBuilder("schedule")
      .select("DISTINCT schedule.showTime", "showTime")
      .where("schedule.movieId = :movieId", { movieId })
      .andWhere("schedule.theatreId = :theatreId", { theatreId })
      .andWhere("schedule.screenId = :screenId", { screenId })
      .andWhere("schedule.showDate = :showDate", { showDate })
      // .andWhere(
      //   `((schedule.showDate = :today AND schedule.showTime >= :time) OR (schedule.showDate > :today))`,
      //   { today, time },
      // )
      .andWhere("schedule.status NOT IN (:...statuses)", {
        statuses: [ScheduleStatus.inActive, ScheduleStatus.completed],
      })
      .getRawMany();

    const formattedShowDates = showTimes.map((time) =>
      time.showTime.slice(0, 5),
    );
    return {
      status: 200,
      data: formattedShowDates,
    };
  }

  async addSchedule(body: ScheduleBodyType, user: User) {
    const {
      showDate,
      showTime,
      movieId,
      theatreId,
      screenId,
      language,
      subtitle,
    } = body;

    const existingShow = await this.scheduleRepo.findOne({
      where: { showDate, showTime, screen: { id: screenId } },
    });
    if (existingShow) {
      throw new Error("Schedule already exists.");
    }

    const movie = await this.movieRepo.findOne({
      relations: ["schedules"],
      where: { id: movieId },
    });
    const theatre: any = theatreId
      ? await this.theatreRepo.findOne({ where: { id: theatreId } })
      : {};
    const screen = await this.screenRepo.findOne({
      where: { id: screenId, theatre: { id: theatreId } },
    });

    if (!movie) {
      throw new Error("Movie does not exists!");
    }

    if (!theatre) {
      throw new Error("Theatre does not exists!");
    }

    if (!screen) {
      throw new Error("Screen does not exists!");
    }

    const newShow = this.scheduleRepo.create({
      showDate,
      showTime,
      multiplier: parseFloat(body.multiplier),
      availableSeats: body.availableSeats,
      status: body.isActive ? ScheduleStatus.active : ScheduleStatus.inActive,
      language,
      subtitle,
      movie,
      theatre: theatre,
      screen: screen,
      bookedSeats: [],
    });
    const show = await this.scheduleRepo.save(newShow);

    const seatTypes = await this.seatTypeRepo.find();

    for (const type of seatTypes) {
      const updatedPrice =
        newShow?.multiplier * type.price * screen?.multiplier;

      const scheduleSeatType = this.scheduleSeatTypeRepo.create({
        schedule: newShow,
        seatType: type,
        price: updatedPrice,
      });
      if (scheduleSeatType) {
        await this.scheduleSeatTypeRepo.save(scheduleSeatType);
      }
    }

    movie.schedules.push(show); // include the new schedule
    const updatedMovie = updateMovie(movie);
    await this.movieRepo.save(updatedMovie);

    const message = `${
      user.name
    } created New Schedule for '${movie?.title.toUpperCase()}' at ${
      screen.name
    } on ${show?.showDate}, ${show?.showTime.slice(0, 5)}).`;

    addNotification(
      NOTI_TYPE.SCHEDULE_ADDED,
      "Schedule Added",
      message,
      user.id,
      theatre?.id,
    );

    return {
      status: 200,
      message: "Schedule added successfully",
      data: newShow,
    };
  }

  async updateSchedule(scheduleId: number, body: ScheduleBodyType, user: User) {
    const {
      showDate,
      showTime,
      movieId,
      theatreId,
      screenId,
      language,
      subtitle,
    } = body;

    const schedule = await this.scheduleRepo.findOne({
      where: { id: scheduleId },
    });

    if (schedule.bookedSeats?.length > 0) {
      throw new Error("Schedule cannot be updated as bookings are made!");
    }

    if (!schedule) {
      throw new Error("Schedule does not exists.");
    }

    const existingShow = await this.scheduleRepo.findOne({
      where: { showDate, showTime, screen: { id: screenId } },
    });
    if (existingShow && existingShow.id !== schedule.id) {
      throw new Error("Schedule already exists.");
    }

    const movie = await this.movieRepo.findOne({
      relations: ["schedules"],
      where: { id: movieId },
    });

    const theatre: any = theatreId
      ? await this.theatreRepo.findOne({ where: { id: theatreId } })
      : {};
    const screen = await this.screenRepo.findOne({ where: { id: screenId } });

    const updatedSchedule = {
      ...schedule,
      showDate,
      showTime,
      multiplier: parseFloat(body.multiplier),
      availableSeats: body.availableSeats,
      status: !body.isActive ? ScheduleStatus.inActive : schedule.status,
      language,
      subtitle,
      movie: movie,
      theatre: theatre,
      screen: screen,
    };

    await this.scheduleRepo.save(updatedSchedule);

    const seatTypes = await this.seatTypeRepo.find();

    const scheduleSeatTypes = await this.scheduleSeatTypeRepo.find({
      relations: ["schedule", "seatType"],
      where: { schedule: { id: scheduleId } },
    });

    for (const type of seatTypes) {
      const selectedType = scheduleSeatTypes.find(
        (item) => item.seatType.id === type.id,
      );

      const updatedPrice =
        updatedSchedule?.multiplier * screen?.multiplier * type.price;

      const scheduleSeatType = this.scheduleSeatTypeRepo.create({
        ...(selectedType ?? {}), // existing record will be updated
        schedule: updatedSchedule,
        seatType: type,
        price: updatedPrice,
      });

      await this.scheduleSeatTypeRepo.save(scheduleSeatType);
    }

    if (movie) {
      const updatedMovie = movie ? updateMovie(movie) : null;
      await this.movieRepo.save(updatedMovie);
    }

    const message = `${
      user.name
    } updated Schedule for '${movie?.title.toUpperCase()}' at ${
      screen.name
    } on ${schedule?.showDate}, ${schedule?.showTime.slice(0, 5)}).`;

    addNotification(
      NOTI_TYPE.SCHEDULE_UPDATED,
      "Schedule Updated",
      message,
      user.id,
      theatre?.id,
    );

    return {
      status: 200,
      message: "Schedule updated successfully",
      data: updatedSchedule,
    };
  }

  async deleteSchedule(scheduleId: number, user: User) {
    const schedule = await this.scheduleRepo.findOne({
      relations: ["movie", "screen", "theatre"],
      where: { id: scheduleId },
    });

    const scheduleSeatTypeList = await this.scheduleSeatTypeRepo.find({
      where: { schedule: { id: scheduleId } },
    });

    for (const type of scheduleSeatTypeList) {
      await this.scheduleSeatTypeRepo.remove(type);
    }

    if (!schedule) {
      throw new Error("Schedule does not exists.");
    }

    if (schedule.bookedSeats?.length > 0) {
      throw new Error("Schedule cannot be deleted");
    }
    await this.scheduleRepo.remove(schedule);

    if (schedule.movie) {
      const updatedMovie = schedule.movie ? updateMovie(schedule.movie) : null;
      await this.movieRepo.save(updatedMovie);
    }
    const message = `${
      user.name
    } cancelled Schedule for '${schedule?.movie?.title.toUpperCase()}' at ${
      schedule?.screen.name
    } on ${schedule?.showDate}, ${schedule?.showTime.slice(0, 5)}).`;

    addNotification(
      NOTI_TYPE.SCHEDULE_DELETED,
      "Schedule Cancelled",
      message,
      user.id,
      schedule?.theatre?.id,
    );

    return {
      status: 200,
      message: "Schedule deleted successfully",
    };
  }
}
