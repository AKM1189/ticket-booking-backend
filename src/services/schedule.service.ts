import dayjs from "dayjs";
import { AppDataSource } from "../data-source";
import { Movie } from "../entity/Movie";
import { Schedule } from "../entity/Schedule";
import { Screen } from "../entity/Screen";
import { Theatre } from "../entity/Theatre";
import { ScheduleBodyType, ScheduleType } from "../types/ScheduleType";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { SeatType } from "../entity/SeatType";
import { ScheduleSeatType } from "../entity/ScheduleSeatType";
import { updateMovieStatus } from "../utils/updateMovieStatus";
import { updateMovie } from "../utils/updateMovie";

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
  ) {
    const [schedules, total] = await this.scheduleRepo.findAndCount({
      relations: ["movie", "theatre", "screen"],
      order: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
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
      .andWhere("schedule.isActive = 1")
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
      .andWhere("schedule.isActive = 1")
      .andWhere(
        `((schedule.showDate = :today AND schedule.showTime >= :time) OR (schedule.showDate > :today))`,
        { today, time },
      )
      .andWhere("schedule.isActive = 1")
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
      .andWhere("schedule.isActive = 1")
      .getRawMany();

    const formattedShowDates = showTimes.map((time) =>
      time.showTime.slice(0, 5),
    );
    return {
      status: 200,
      data: formattedShowDates,
    };
  }

  async addSchedule(body: ScheduleBodyType) {
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
    const theatre = theatreId
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
      isActive: body.isActive,
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

    return {
      status: 200,
      message: "Schedule added successfully",
      data: newShow,
    };
  }

  async updateSchedule(scheduleId: number, body: ScheduleBodyType) {
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

    const theatre = theatreId
      ? await this.theatreRepo.findOne({ where: { id: theatreId } })
      : {};
    const screen = await this.screenRepo.findOne({ where: { id: screenId } });

    const updatedSchedule = {
      ...schedule,
      showDate,
      showTime,
      multiplier: parseFloat(body.multiplier),
      availableSeats: body.availableSeats,
      isActive: body.isActive,
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

    return {
      status: 200,
      message: "Schedule updated successfully",
      data: updatedSchedule,
    };
  }

  async deleteSchedule(scheduleId: number) {
    const schedule = await this.scheduleRepo.findOne({
      relations: ["movie"],
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
    return {
      status: 200,
      message: "Schedule deleted successfully",
    };
  }
}
