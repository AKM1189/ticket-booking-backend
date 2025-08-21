import { AppDataSource } from "../data-source";
import { Schedule } from "../entity/Schedule";

export class ScheduleService {
  private scheduleRepo = AppDataSource.getRepository(Schedule);

  async getSchedule() {}
}
