import { AppDataSource } from "../../data-source";
import { Screen } from "../../entity/Screen";
import { Theatre } from "../../entity/Theatre";
import { User } from "../../entity/User";
import { Role } from "../../types/AuthType";

export class AboutService {
  private theatreRepo = AppDataSource.getRepository(Theatre);
  private screenRepo = AppDataSource.getRepository(Screen);
  private userRepo = AppDataSource.getRepository(User);

  async getAboutInfo() {
    const [theatres, theatreTotal] = await this.theatreRepo.findAndCount();
    const [screens, screenTotal] = await this.screenRepo.findAndCount();
    const [users, customerTotal] = await this.userRepo.findAndCount({
      where: { role: Role.user },
    });

    const cities = await this.theatreRepo
      .createQueryBuilder("theatre")
      .select("COUNT(DISTINCT theatre.city)", "cityTotal")
      .getRawOne();

    return {
      status: 200,
      data: {
        theatreTotal,
        screenTotal,
        customerTotal,
        cityTotal: cities.cityTotal,
      },
    };
  }
}
