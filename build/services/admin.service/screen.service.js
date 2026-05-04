"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenService = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../../data-source");
const Screen_1 = require("../../entity/Screen");
const Theatre_1 = require("../../entity/Theatre");
const SeatType_1 = require("../../entity/SeatType");
const ScreenSeatType_1 = require("../../entity/ScreenSeatType");
const addNoti_1 = require("../../utils/addNoti");
const constants_1 = require("../../constants");
const Schedule_1 = require("../../entity/Schedule");
class ScreenService {
    screenRepo = data_source_1.AppDataSource.getRepository(Screen_1.Screen);
    scheduleRepo = data_source_1.AppDataSource.getRepository(Schedule_1.Schedule);
    theatreRepo = data_source_1.AppDataSource.getRepository(Theatre_1.Theatre);
    seatTypeRepo = data_source_1.AppDataSource.getRepository(SeatType_1.SeatType);
    screenSeatTypeRepo = data_source_1.AppDataSource.getRepository(ScreenSeatType_1.ScreenSeatType);
    async getScreen(search, page, limit, sortBy, sortOrder, filter) {
        let active = filter === "active";
        let whereClause = {};
        if (search && filter) {
            whereClause = [
                { active, name: (0, typeorm_1.Like)(`%${search}%`) },
                { active, type: (0, typeorm_1.Like)(`%${search}%`) },
                {
                    active,
                    theatre: { name: (0, typeorm_1.Like)(`%${search}%`) },
                },
            ];
        }
        else if (filter) {
            whereClause = {
                active,
            };
        }
        else if (search) {
            whereClause = [
                { name: (0, typeorm_1.Like)(`%${search}%`) },
                { type: (0, typeorm_1.Like)(`%${search}%`) },
                {
                    theatre: { name: (0, typeorm_1.Like)(`%${search}%`) },
                },
            ];
        }
        const [screens, total] = await this.screenRepo.findAndCount({
            relations: ["theatre", "seatTypes.seatType"],
            order: {
                [sortBy]: sortOrder,
            },
            skip: (page - 1) * limit,
            take: limit,
            where: whereClause,
        });
        // Transform seatTypes id -> typeId
        const transformedScreens = screens.map((screen) => ({
            ...screen,
            multiplier: parseFloat(screen.multiplier.toString()),
        }));
        return {
            status: 200,
            data: transformedScreens,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getScreenByTheatre(theatreId) {
        const [screens] = await this.screenRepo.findAndCount({
            relations: ["theatre", "seatTypes.seatType"],
            where: { theatre: { id: parseInt(theatreId) } },
        });
        // Transform seatTypes id -> typeId
        const transformedScreens = screens.map((screen) => ({
            ...screen,
            multiplier: parseFloat(screen.multiplier.toString()),
        }));
        return {
            status: 200,
            data: transformedScreens,
        };
    }
    async getScreenByShow(theatreId, movieId) {
        const screens = await data_source_1.AppDataSource.getRepository(Screen_1.Screen)
            .createQueryBuilder("screen")
            .innerJoin("screen.schedules", "schedule")
            .innerJoin("schedule.theatre", "theatre")
            .innerJoin("schedule.movie", "movie")
            .where("movie.id = :movieId", { movieId })
            .andWhere("theatre.id = :theatreId", { theatreId })
            .leftJoinAndSelect("screen.seatTypes", "seatTypes")
            .leftJoinAndSelect("seatTypes.seatType", "seatType")
            // .distinct(true)
            .getMany();
        return {
            status: 200,
            data: screens,
        };
    }
    async addScreen(body, user) {
        const existingScreen = await this.screenRepo.findOne({
            relations: ["theatre"],
            where: {
                name: body.name,
                theatre: { id: parseInt(body.theatreId) },
            },
        });
        if (existingScreen) {
            throw new Error("Screen already exists.");
        }
        const theatreEntity = await this.theatreRepo.findOneBy({
            id: parseInt(body?.theatreId),
        });
        const newScreen = this.screenRepo.create({
            name: body.name,
            type: body.type,
            capacity: body.capacity,
            rows: body.rows,
            cols: body.cols,
            active: body.active,
            disabledSeats: body.disabledSeats,
            aisles: body.aisles,
            multiplier: body.multiplier,
            theatre: theatreEntity,
            createdAt: new Date(),
            updatedAt: null,
        });
        const screen = await this.screenRepo.save(newScreen);
        // Save seat types for this screen
        for (const st of body.seatTypes) {
            const seatTypeEntity = await this.seatTypeRepo.findOneBy({
                id: parseInt(st.typeId),
            });
            if (!seatTypeEntity)
                continue;
            const screenSeatType = this.screenSeatTypeRepo.create({
                screen: newScreen,
                seatType: seatTypeEntity,
                seatList: st.seatList,
            });
            await this.screenSeatTypeRepo.save(screenSeatType);
        }
        await this.theatreRepo.save({
            ...theatreEntity,
            totalScreens: theatreEntity.totalScreens + 1,
        });
        const message = `${user.name} added ${screen.name} screen to '${theatreEntity.name}' theatre.`;
        (0, addNoti_1.addNotification)(constants_1.NOTI_TYPE.SCREEN_ADDED, "Screen Added", message, user.id, theatreEntity?.id);
        return {
            status: 200,
            message: "Screen added successfully",
            data: newScreen,
        };
    }
    async updateScreen(screenId, body, user) {
        const { name } = body;
        const existingScreenById = await this.screenRepo.findOne({
            relations: ["theatre"],
            where: { id: screenId },
        });
        if (!existingScreenById) {
            return {
                status: 404,
                message: "Screen not found.",
            };
        }
        const existingScreenByName = await this.screenRepo.findOne({
            relations: ["theatre"],
            where: {
                name,
            },
        });
        if (existingScreenByName &&
            existingScreenByName.id !== screenId &&
            parseInt(body.theatreId) === existingScreenByName.theatre.id) {
            return {
                status: 400,
                message: "Screen name already exists.",
            };
        }
        const theatreEntity = await this.theatreRepo.findOne({
            relations: ["screens"],
            where: { id: parseInt(body?.theatreId) },
        });
        const updatedScreen = {
            ...existingScreenById,
            name: body.name,
            type: body.type,
            capacity: body.capacity,
            rows: body.rows,
            cols: body.cols,
            active: body.active,
            disabledSeats: body.disabledSeats,
            aisles: body.aisles,
            multiplier: body.multiplier,
            theatre: theatreEntity,
        };
        const saved = await this.screenRepo.save(updatedScreen);
        if (existingScreenById?.capacity !== body.capacity) {
            await this.scheduleRepo.update({ screen: { id: existingScreenById.id } }, { availableSeats: body.capacity - body.disabledSeats.length });
        }
        // Update totalScreens
        const oldTheatreId = existingScreenById.theatre?.id;
        const newTheatreId = theatreEntity.id;
        // 1️⃣ Old theatre (if changed)
        if (oldTheatreId && oldTheatreId !== newTheatreId) {
            const oldTheatre = await this.theatreRepo.findOne({
                where: { id: oldTheatreId },
                relations: ["screens"],
            });
            if (oldTheatre) {
                oldTheatre.totalScreens = oldTheatre.screens.length;
                await this.theatreRepo.save(oldTheatre);
            }
        }
        // 2️⃣ New theatre
        const updatedTheatre = await this.theatreRepo.findOne({
            where: { id: newTheatreId },
            relations: ["screens"],
        });
        if (updatedTheatre) {
            updatedTheatre.totalScreens = updatedTheatre.screens.length;
            await this.theatreRepo.save(updatedTheatre);
        }
        // if (existingTheatre?.id !== theatreEntity?.id) {
        //   await this.theatreRepo.save({
        //     ...existingTheatre,
        //     totalScreens: existingTheatre.totalScreens - 1,
        //   });
        //   await this.theatreRepo.save({
        //     ...theatreEntity,
        //     totalScreens: theatreEntity.totalScreens + 1,
        //   });
        // }
        // Fetch existing rows for this screen
        const existingSeatTypes = await this.screenSeatTypeRepo.find({
            where: { screen: { id: screenId } },
            relations: ["seatType"],
        });
        // Build a map
        const seatTypeMap = new Map(existingSeatTypes.map((s) => [s.seatType.id, s]));
        // Loop request seatTypes
        for (const st of body.seatTypes) {
            const typeId = parseInt(st.typeId);
            const seatList = st.seatList;
            if (seatTypeMap.has(typeId)) {
                // ✅ Update existing entity (has id)
                const existing = seatTypeMap.get(typeId);
                existing.seatList = seatList;
                await this.screenSeatTypeRepo.save(existing); // id exists
                seatTypeMap.delete(typeId);
            }
            else {
                // ✅ Create new entity
                const seatTypeEntity = await this.seatTypeRepo.findOneBy({
                    id: typeId,
                });
                if (!seatTypeEntity)
                    continue;
                const newSeatType = this.screenSeatTypeRepo.create({
                    screen: updatedScreen, // proper entity
                    seatType: seatTypeEntity,
                    seatList,
                });
                await this.screenSeatTypeRepo.save(newSeatType); // now id is generated after save
            }
        }
        // Remove seat types not in request
        for (const remaining of seatTypeMap.values()) {
            await this.screenSeatTypeRepo.remove(remaining); // has id
        }
        const message = `${user.name} updated ${existingScreenById.name} screen in '${theatreEntity.name}' theatre.`;
        (0, addNoti_1.addNotification)(constants_1.NOTI_TYPE.SCREEN_UPDATED, "Screen Updated", message, user.id, theatreEntity?.id);
        return {
            status: 200,
            message: "Screen updated successfully.",
            data: saved,
        };
    }
    async deleteScreen(screenId, user) {
        const screen = await this.screenRepo.findOne({
            where: { id: screenId },
            relations: ["theatre"],
        });
        if (!screen) {
            return {
                status: 404,
                message: "Screen not found",
            };
        }
        const theatre = await this.theatreRepo.findOneBy({ id: screen.theatre.id });
        await this.theatreRepo.save({
            ...theatre,
            totalScreens: theatre?.totalScreens - 1,
        });
        await this.screenRepo.save({ ...screen, active: !screen.active });
        const message = `${user.name} deactivated ${screen.name} screen in '${theatre.location}' theatre.`;
        (0, addNoti_1.addNotification)(screen.active ? constants_1.NOTI_TYPE.SCREEN_DEACTIVATED : constants_1.NOTI_TYPE.SCREEN_ACTIVATED, `Screen ${screen.active ? "Deactivated" : "Activated"}`, message, user.id, theatre?.id);
        return {
            status: 200,
            message: `Screen ${screen.active ? "deactiveated" : "activated"} successfully.`,
        };
    }
}
exports.ScreenService = ScreenService;
//# sourceMappingURL=screen.service.js.map