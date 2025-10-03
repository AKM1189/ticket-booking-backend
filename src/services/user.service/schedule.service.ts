import { AppDataSource } from "../../data-source";
import { Schedule } from "../../entity/Schedule";
import { SeatType } from "../../entity/SeatType";

export class ScheduleService {
  private scheduleRepo = AppDataSource.getRepository(Schedule);
  private seatTypeRepo = AppDataSource.getRepository(SeatType);

  async getScheduleDetail(scheduleId: number) {
    const schedule = await this.scheduleRepo.findOne({
      relations: [
        "movie",
        "theatre",
        "screen",
        "screen.seatTypes",
        "screen.seatTypes.seatType",
      ],
      where: { id: scheduleId },
    });

    const seatTypes = await this.seatTypeRepo.find();

    const seatTypeList = seatTypes.map((item) => {
      const price =
        item.price * schedule.multiplier * schedule.screen.multiplier;
      return {
        ...item,
        price: parseFloat(price.toString()).toFixed(2),
      };
    });

    return {
      data: {
        ...schedule,
        priceList: seatTypeList,
      },
      status: 200,
    };
  }
}
