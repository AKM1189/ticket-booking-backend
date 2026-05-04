"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AboutService = void 0;
const data_source_1 = require("../../data-source");
const Screen_1 = require("../../entity/Screen");
const Theatre_1 = require("../../entity/Theatre");
const User_1 = require("../../entity/User");
const AuthType_1 = require("../../types/AuthType");
class AboutService {
    theatreRepo = data_source_1.AppDataSource.getRepository(Theatre_1.Theatre);
    screenRepo = data_source_1.AppDataSource.getRepository(Screen_1.Screen);
    userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
    async getAboutInfo() {
        const [theatres, theatreTotal] = await this.theatreRepo.findAndCount();
        const [screens, screenTotal] = await this.screenRepo.findAndCount();
        const [users, customerTotal] = await this.userRepo.findAndCount({
            where: { role: AuthType_1.Role.user },
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
exports.AboutService = AboutService;
//# sourceMappingURL=about.service.js.map