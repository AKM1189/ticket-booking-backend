import { AppDataSource } from "../../data-source";
import { Theatre } from "../../entity/Theatre";
import dayjs from "dayjs";
import { ScheduleStatus } from "../../types/ScheduleType";

export class TheatreService {
  private theatreRepo = AppDataSource.getRepository(Theatre);

  async getShowingTheatres() {
    const today = dayjs().format("YYYY-MM-DD");
    const maxDay = dayjs().add(4, "day").format("YYYY-MM-DD");
    const theatres = await this.theatreRepo
      .createQueryBuilder("theatre")
      .innerJoin("theatre.schedules", "schedule")
      .innerJoin("schedule.movie", "movie")
      .andWhere(
        `(schedule.showDate >= :today AND schedule.showDate <= :maxDay)`,
        { today, maxDay },
      )
      .andWhere("schedule.status NOT IN (:...status)", {
        status: [ScheduleStatus.inActive, ScheduleStatus.completed],
      })
      .andWhere("theatre.active = 1")
      .distinct(true)
      .getMany();

    return {
      status: 200,
      data: theatres,
    };
  }
}
