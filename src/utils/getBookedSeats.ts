import { AppDataSource } from "../data-source";
import { Schedule } from "../entity/Schedule";

export const getBookedSeats = async (scheduleId: number) => {
  const scheduleRepo = AppDataSource.getRepository(Schedule);

  const schedule = await scheduleRepo.findOne({
    where: { id: scheduleId },
  });

  return schedule?.bookedSeats;
};
