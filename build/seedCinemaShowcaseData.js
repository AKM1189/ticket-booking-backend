"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
const dayjs_1 = __importDefault(require("dayjs"));
const typeorm_1 = require("typeorm");
const data_source_1 = require("./data-source");
const Cast_1 = require("./entity/Cast");
const Genre_1 = require("./entity/Genre");
const Image_1 = require("./entity/Image");
const Movie_1 = require("./entity/Movie");
const Schedule_1 = require("./entity/Schedule");
const ScheduleSeatType_1 = require("./entity/ScheduleSeatType");
const Screen_1 = require("./entity/Screen");
const ScreenSeatType_1 = require("./entity/ScreenSeatType");
const SeatType_1 = require("./entity/SeatType");
const Theatre_1 = require("./entity/Theatre");
const MovieType_1 = require("./types/MovieType");
const ScheduleType_1 = require("./types/ScheduleType");
dotenv_1.default.config();
const SCREEN_ROWS = 8;
const SCREEN_COLS = 12;
const SEAT_TYPE_NAMES = ["Standard", "Prime", "Recliner"];
const BRAND_NAME = "Aurora Cinemas";
const seatTypeSeeds = [
    { name: "Standard", price: 8.5 },
    { name: "Prime", price: 11.5 },
    { name: "Recliner", price: 15.0 },
];
const genreSeeds = [
    {
        name: "Action",
        description: "High-energy stories built around momentum, set pieces, and conflict.",
        color: "#E11D48",
    },
    {
        name: "Adventure",
        description: "Large-scale journeys with discovery, danger, and world-building.",
        color: "#F97316",
    },
    {
        name: "Sci-Fi",
        description: "Speculative stories shaped by technology, science, or imagined futures.",
        color: "#2563EB",
    },
    {
        name: "Thriller",
        description: "Tense narratives driven by pressure, mystery, and escalating stakes.",
        color: "#7C3AED",
    },
    {
        name: "Drama",
        description: "Character-led stories focused on emotional change and consequence.",
        color: "#0F766E",
    },
    {
        name: "Romance",
        description: "Stories centered on connection, longing, and intimacy.",
        color: "#DB2777",
    },
    {
        name: "Mystery",
        description: "Puzzle-driven stories where clues gradually reveal the truth.",
        color: "#475569",
    },
    {
        name: "Fantasy",
        description: "Stories shaped by myth, magic, and imaginative worlds.",
        color: "#8B5CF6",
    },
    {
        name: "Animation",
        description: "Stylized stories created through animated performance and visual craft.",
        color: "#F59E0B",
    },
    {
        name: "Family",
        description: "Accessible stories designed for mixed-age audiences and shared viewing.",
        color: "#16A34A",
    },
];
const castSeeds = [
    {
        name: "Ava Hart",
        role: "Actor",
        imageUrl: buildImageUrl("Ava Hart", "Cast", "334155", "F8FAFC", 600, 600),
    },
    {
        name: "Leo Quinn",
        role: "Actor",
        imageUrl: buildImageUrl("Leo Quinn", "Cast", "1D4ED8", "F8FAFC", 600, 600),
    },
    {
        name: "Maya Lin",
        role: "Actor",
        imageUrl: buildImageUrl("Maya Lin", "Cast", "BE123C", "FFF7ED", 600, 600),
    },
    {
        name: "Noah Vale",
        role: "Actor",
        imageUrl: buildImageUrl("Noah Vale", "Cast", "0F766E", "F0FDFA", 600, 600),
    },
    {
        name: "Zara Chen",
        role: "Actor",
        imageUrl: buildImageUrl("Zara Chen", "Cast", "7C3AED", "FAF5FF", 600, 600),
    },
    {
        name: "Ethan Blake",
        role: "Actor",
        imageUrl: buildImageUrl("Ethan Blake", "Cast", "C2410C", "FFF7ED", 600, 600),
    },
    {
        name: "Sofia Noor",
        role: "Actor",
        imageUrl: buildImageUrl("Sofia Noor", "Cast", "0369A1", "F0F9FF", 600, 600),
    },
    {
        name: "Daniel Cross",
        role: "Actor",
        imageUrl: buildImageUrl("Daniel Cross", "Cast", "4338CA", "EEF2FF", 600, 600),
    },
    {
        name: "Hana Myint",
        role: "Actor",
        imageUrl: buildImageUrl("Hana Myint", "Cast", "EA580C", "FFFBEB", 600, 600),
    },
    {
        name: "Aria Stone",
        role: "Actor",
        imageUrl: buildImageUrl("Aria Stone", "Cast", "C026D3", "FDF4FF", 600, 600),
    },
    {
        name: "Kieran Holt",
        role: "Actor",
        imageUrl: buildImageUrl("Kieran Holt", "Cast", "15803D", "F0FDF4", 600, 600),
    },
    {
        name: "Mei Sato",
        role: "Actor",
        imageUrl: buildImageUrl("Mei Sato", "Cast", "A21CAF", "FDF4FF", 600, 600),
    },
    {
        name: "Lucas Ray",
        role: "Director",
        imageUrl: buildImageUrl("Lucas Ray", "Director", "111827", "F9FAFB", 600, 600),
    },
    {
        name: "Elena Park",
        role: "Director",
        imageUrl: buildImageUrl("Elena Park", "Director", "1E293B", "F8FAFC", 600, 600),
    },
    {
        name: "Theo Bennett",
        role: "Director",
        imageUrl: buildImageUrl("Theo Bennett", "Director", "3F3F46", "FAFAFA", 600, 600),
    },
    {
        name: "Nadia Karim",
        role: "Director",
        imageUrl: buildImageUrl("Nadia Karim", "Director", "581C87", "FAF5FF", 600, 600),
    },
    {
        name: "Min Thant",
        role: "Director",
        imageUrl: buildImageUrl("Min Thant", "Director", "0F172A", "E2E8F0", 600, 600),
    },
    {
        name: "Olivia Frost",
        role: "Director",
        imageUrl: buildImageUrl("Olivia Frost", "Director", "134E4A", "F0FDFA", 600, 600),
    },
];
const theatreSeeds = [
    {
        name: BRAND_NAME,
        location: "Downtown Centre",
        region: "Yangon Region",
        city: "Yangon",
        phoneNo: "09-5500-1001",
        screens: [
            {
                name: "Screen 1",
                type: "2D Digital",
                multiplier: 1.0,
                disabledSeats: ["A1", "A12", "H1", "H12"],
                aisles: [4, 8],
            },
            {
                name: "Luxe",
                type: "Luxury Recliner",
                multiplier: 1.3,
                disabledSeats: ["A1", "A12", "B1", "B12"],
                aisles: [4, 8],
            },
        ],
    },
    {
        name: BRAND_NAME,
        location: "Lakeside Mall",
        region: "Yangon Region",
        city: "Yangon",
        phoneNo: "09-5500-1002",
        screens: [
            {
                name: "Screen 1",
                type: "RealD 3D",
                multiplier: 1.15,
                disabledSeats: ["A1", "A12", "H1", "H12"],
                aisles: [4, 8],
            },
            {
                name: "IMAX",
                type: "IMAX",
                multiplier: 1.4,
                disabledSeats: ["A1", "A12", "H1", "H12"],
                aisles: [4, 8],
            },
        ],
    },
    {
        name: BRAND_NAME,
        location: "Hillview Plaza",
        region: "Mandalay Region",
        city: "Mandalay",
        phoneNo: "09-5500-1003",
        screens: [
            {
                name: "Screen 1",
                type: "2D Digital",
                multiplier: 1.0,
                disabledSeats: ["A1", "A12", "H1", "H12"],
                aisles: [4, 8],
            },
            {
                name: "Premiere",
                type: "Premium 3D",
                multiplier: 1.25,
                disabledSeats: ["A1", "A12", "H1", "H12"],
                aisles: [4, 8],
            },
        ],
    },
    {
        name: BRAND_NAME,
        location: "Riverfront Square",
        region: "Bago Region",
        city: "Bago",
        phoneNo: "09-5500-1004",
        screens: [
            {
                name: "Screen 1",
                type: "2D Digital",
                multiplier: 1.0,
                disabledSeats: ["A1", "A12", "H1", "H12"],
                aisles: [4, 8],
            },
            {
                name: "Screen 2",
                type: "Premium 2D",
                multiplier: 1.1,
                disabledSeats: ["A1", "A12", "H1", "H12"],
                aisles: [4, 8],
            },
        ],
    },
];
const movieThemes = [
    ["0F172A", "E2E8F0"],
    ["1D4ED8", "EFF6FF"],
    ["7C2D12", "FFF7ED"],
    ["5B21B6", "F5F3FF"],
    ["14532D", "F0FDF4"],
    ["9F1239", "FFF1F2"],
    ["1E293B", "F8FAFC"],
    ["92400E", "FFFBEB"],
    ["164E63", "ECFEFF"],
    ["831843", "FDF2F8"],
    ["312E81", "EEF2FF"],
    ["0C4A6E", "F0F9FF"],
    ["365314", "F7FEE7"],
    ["713F12", "FEFCE8"],
    ["3F3F46", "FAFAFA"],
    ["4C1D95", "F5F3FF"],
    ["155E75", "ECFEFF"],
    ["7F1D1D", "FEF2F2"],
    ["166534", "F0FDF4"],
    ["4A044E", "FDF4FF"],
];
const movieSeeds = [
    {
        title: "Midnight Runway",
        description: "A suspended cargo pilot races across a storm corridor to expose a black-market flight network before dawn.",
        duration: "127",
        language: ["English"],
        subtitle: ["Myanmar"],
        experience: ["2D"],
        genres: ["Action", "Thriller"],
        casts: ["Ava Hart", "Leo Quinn", "Lucas Ray"],
        trailerId: "midnight-runway-trailer",
        statusGroup: "nowShowing",
    },
    {
        title: "Solar Drift",
        description: "A repair crew stranded beyond lunar orbit discovers their rescue signal is pulling something else toward them.",
        duration: "134",
        language: ["English", "Myanmar"],
        subtitle: ["English"],
        experience: ["2D", "IMAX"],
        genres: ["Sci-Fi", "Adventure"],
        casts: ["Maya Lin", "Noah Vale", "Elena Park"],
        trailerId: "solar-drift-trailer",
        statusGroup: "nowShowing",
    },
    {
        title: "Riverstone Files",
        description: "An archivist and a detective unlock a decades-old conspiracy buried in a floodplain case file.",
        duration: "118",
        language: ["English"],
        subtitle: ["Myanmar"],
        experience: ["2D"],
        genres: ["Mystery", "Thriller"],
        casts: ["Zara Chen", "Daniel Cross", "Theo Bennett"],
        trailerId: "riverstone-files-trailer",
        statusGroup: "nowShowing",
    },
    {
        title: "Crimson Monsoon",
        description: "Two rival journalists cover a cyclone season that keeps drawing them back to the same vanished village.",
        duration: "122",
        language: ["Myanmar", "English"],
        subtitle: ["English"],
        experience: ["2D"],
        genres: ["Drama", "Romance"],
        casts: ["Hana Myint", "Ethan Blake", "Min Thant"],
        trailerId: "crimson-monsoon-trailer",
        statusGroup: "nowShowing",
    },
    {
        title: "Neon Frontier",
        description: "A courier in a vertical megacity uncovers a memory-smuggling ring hidden inside the transit grid.",
        duration: "129",
        language: ["English"],
        subtitle: ["Myanmar", "English"],
        experience: ["2D", "3D"],
        genres: ["Action", "Sci-Fi"],
        casts: ["Sofia Noor", "Kieran Holt", "Nadia Karim"],
        trailerId: "neon-frontier-trailer",
        statusGroup: "nowShowing",
    },
    {
        title: "Paper Lanterns",
        description: "Three siblings reopen their family theatre and discover the final season their mother never staged.",
        duration: "111",
        language: ["Myanmar"],
        subtitle: ["English"],
        experience: ["2D"],
        genres: ["Drama", "Family"],
        casts: ["Hana Myint", "Aria Stone", "Olivia Frost"],
        trailerId: "paper-lanterns-trailer",
        statusGroup: "nowShowing",
    },
    {
        title: "Iron Harbor",
        description: "When a supply port is seized by mercenaries, a retired naval engineer rebuilds the harbor defenses overnight.",
        duration: "136",
        language: ["English"],
        subtitle: ["English"],
        experience: ["2D", "IMAX"],
        genres: ["Action", "Adventure"],
        casts: ["Leo Quinn", "Noah Vale", "Lucas Ray"],
        trailerId: "iron-harbor-trailer",
        statusGroup: "nowShowing",
    },
    {
        title: "Echoes of Orion",
        description: "A grieving astronomer begins receiving impossible broadcasts from a colony mission declared lost ten years earlier.",
        duration: "132",
        language: ["English"],
        subtitle: ["Myanmar"],
        experience: ["2D", "3D"],
        genres: ["Sci-Fi", "Fantasy"],
        casts: ["Maya Lin", "Mei Sato", "Elena Park"],
        trailerId: "echoes-of-orion-trailer",
        statusGroup: "nowShowing",
    },
    {
        title: "Velvet Thunder",
        description: "A motorcycle stunt team agrees to one last stadium tour and uncovers the promoter behind a decades-old sabotage case.",
        duration: "124",
        language: ["English"],
        subtitle: ["Myanmar"],
        experience: ["2D", "3D"],
        genres: ["Action", "Adventure"],
        casts: ["Ava Hart", "Kieran Holt", "Theo Bennett"],
        trailerId: "velvet-thunder-trailer",
        statusGroup: "ticketAvailable",
    },
    {
        title: "The Last Meridian",
        description: "A cartographer mapping disputed borders learns the final line on her map could restart a frozen war.",
        duration: "116",
        language: ["English", "Myanmar"],
        subtitle: ["English"],
        experience: ["2D"],
        genres: ["Drama", "Mystery"],
        casts: ["Zara Chen", "Daniel Cross", "Olivia Frost"],
        trailerId: "the-last-meridian-trailer",
        statusGroup: "ticketAvailable",
    },
    {
        title: "Whisper Code",
        description: "A linguist tracing voice-print malware realizes the infected phrases are being broadcast through public announcements.",
        duration: "121",
        language: ["English"],
        subtitle: ["Myanmar"],
        experience: ["2D"],
        genres: ["Thriller", "Sci-Fi"],
        casts: ["Sofia Noor", "Ethan Blake", "Nadia Karim"],
        trailerId: "whisper-code-trailer",
        statusGroup: "ticketAvailable",
    },
    {
        title: "Kingdom Below",
        description: "An exiled heir descends beneath a ruined capital to reclaim a throne guarded by living stone.",
        duration: "140",
        language: ["English"],
        subtitle: ["English"],
        experience: ["2D", "IMAX"],
        genres: ["Fantasy", "Adventure"],
        casts: ["Noah Vale", "Aria Stone", "Min Thant"],
        trailerId: "kingdom-below-trailer",
        statusGroup: "ticketAvailable",
    },
    {
        title: "Glass Horizon",
        description: "An architect rebuilding a cyclone-devastated waterfront falls for the radio host coordinating the entire district.",
        duration: "109",
        language: ["Myanmar", "English"],
        subtitle: ["English"],
        experience: ["2D"],
        genres: ["Romance", "Drama"],
        casts: ["Hana Myint", "Leo Quinn", "Olivia Frost"],
        trailerId: "glass-horizon-trailer",
        statusGroup: "ticketAvailable",
    },
    {
        title: "Atlas in Bloom",
        description: "A young illustrator and a runaway delivery robot sketch their way across a citywide flower festival.",
        duration: "102",
        language: ["Myanmar", "English"],
        subtitle: ["English"],
        experience: ["2D"],
        genres: ["Family", "Animation"],
        casts: ["Mei Sato", "Ava Hart", "Elena Park"],
        trailerId: "atlas-in-bloom-trailer",
        statusGroup: "ticketAvailable",
    },
    {
        title: "Starlight Protocol",
        description: "A diplomatic convoy carrying a dormant defense AI vanishes hours before the first inter-orbital treaty signing.",
        duration: "128",
        language: ["English"],
        subtitle: ["Myanmar"],
        experience: ["2D", "IMAX"],
        genres: ["Sci-Fi", "Thriller"],
        casts: ["Maya Lin", "Daniel Cross", "Lucas Ray"],
        trailerId: "starlight-protocol-trailer",
        statusGroup: "comingSoon",
    },
    {
        title: "Moon over Mandalay",
        description: "A returning concert pianist reconnects with her first love while preparing a once-in-a-generation riverside performance.",
        duration: "114",
        language: ["Myanmar"],
        subtitle: ["English"],
        experience: ["2D"],
        genres: ["Drama", "Romance"],
        casts: ["Hana Myint", "Ethan Blake", "Min Thant"],
        trailerId: "moon-over-mandalay-trailer",
        statusGroup: "comingSoon",
    },
    {
        title: "The Fifth Ember",
        description: "A rebel blacksmith discovers the last missing ember needed to reawaken a kingdom's sealed guardians.",
        duration: "133",
        language: ["English"],
        subtitle: ["English"],
        experience: ["2D", "3D"],
        genres: ["Fantasy", "Action"],
        casts: ["Kieran Holt", "Zara Chen", "Theo Bennett"],
        trailerId: "the-fifth-ember-trailer",
        statusGroup: "comingSoon",
    },
    {
        title: "Harbor of Kings",
        description: "A salvager chasing a royal shipwreck finds a living map carved into the harbor walls beneath the tide line.",
        duration: "126",
        language: ["English"],
        subtitle: ["Myanmar"],
        experience: ["2D"],
        genres: ["Adventure", "Mystery"],
        casts: ["Noah Vale", "Aria Stone", "Nadia Karim"],
        trailerId: "harbor-of-kings-trailer",
        statusGroup: "comingSoon",
    },
    {
        title: "Saffron Skies",
        description: "A teenage kite maker and her grandfather build a flying lantern machine for the region's biggest harvest parade.",
        duration: "100",
        language: ["Myanmar", "English"],
        subtitle: ["English"],
        experience: ["2D"],
        genres: ["Family", "Animation"],
        casts: ["Mei Sato", "Sofia Noor", "Olivia Frost"],
        trailerId: "saffron-skies-trailer",
        statusGroup: "comingSoon",
    },
    {
        title: "Silent Frequency",
        description: "An emergency-radio engineer realizes a pirate station is predicting disasters minutes before they happen.",
        duration: "119",
        language: ["English"],
        subtitle: ["Myanmar"],
        experience: ["2D"],
        genres: ["Thriller", "Mystery"],
        casts: ["Ava Hart", "Daniel Cross", "Elena Park"],
        trailerId: "silent-frequency-trailer",
        statusGroup: "comingSoon",
    },
];
async function main() {
    await data_source_1.AppDataSource.initialize();
    try {
        const imageRepo = data_source_1.AppDataSource.getRepository(Image_1.Image);
        const genreRepo = data_source_1.AppDataSource.getRepository(Genre_1.Genre);
        const castRepo = data_source_1.AppDataSource.getRepository(Cast_1.Cast);
        const seatTypeRepo = data_source_1.AppDataSource.getRepository(SeatType_1.SeatType);
        const theatreRepo = data_source_1.AppDataSource.getRepository(Theatre_1.Theatre);
        const screenRepo = data_source_1.AppDataSource.getRepository(Screen_1.Screen);
        const screenSeatTypeRepo = data_source_1.AppDataSource.getRepository(ScreenSeatType_1.ScreenSeatType);
        const movieRepo = data_source_1.AppDataSource.getRepository(Movie_1.Movie);
        const scheduleRepo = data_source_1.AppDataSource.getRepository(Schedule_1.Schedule);
        const scheduleSeatTypeRepo = data_source_1.AppDataSource.getRepository(ScheduleSeatType_1.ScheduleSeatType);
        const seatTypeMap = await seedSeatTypes(seatTypeRepo);
        const genreMap = await seedGenres(genreRepo);
        const castMap = await seedCasts(castRepo, imageRepo);
        const screenReferences = await seedTheatresAndScreens(theatreRepo, screenRepo, screenSeatTypeRepo, seatTypeMap);
        const seededTitles = movieSeeds.map((movie) => movie.title);
        await clearSeedSchedules(seededTitles, movieRepo, scheduleRepo, scheduleSeatTypeRepo);
        console.log("seeding started...");
        const movieMap = await seedMovies(movieRepo, imageRepo, genreMap, castMap);
        await seedSchedules(movieMap, screenReferences, seatTypeMap, scheduleRepo, scheduleSeatTypeRepo);
        await refreshDerivedCounts(genreRepo, theatreRepo, movieRepo, screenRepo);
        await refreshMovieStatuses(movieRepo);
        const summary = await buildSummary(movieRepo, theatreRepo, screenRepo, scheduleRepo);
        console.log(JSON.stringify(summary, null, 2));
    }
    finally {
        await data_source_1.AppDataSource.destroy();
    }
}
async function seedSeatTypes(repo) {
    const map = new Map();
    for (const seed of seatTypeSeeds) {
        let seatType = await repo.findOne({ where: { name: seed.name } });
        if (!seatType) {
            seatType = repo.create(seed);
        }
        else {
            seatType.name = seed.name;
            seatType.price = seed.price;
        }
        map.set(seed.name, await repo.save(seatType));
    }
    return map;
}
async function seedGenres(repo) {
    const map = new Map();
    for (const seed of genreSeeds) {
        let genre = await repo.findOne({ where: { name: seed.name } });
        if (!genre) {
            genre = repo.create({
                ...seed,
                movieCount: 0,
            });
        }
        else {
            genre.description = seed.description;
            genre.color = seed.color;
        }
        map.set(seed.name, await repo.save(genre));
    }
    return map;
}
async function seedCasts(castRepo, imageRepo) {
    const map = new Map();
    for (const seed of castSeeds) {
        const image = await upsertImage(imageRepo, seed.imageUrl);
        let cast = await castRepo.findOne({
            where: { name: seed.name, role: seed.role },
            relations: ["image"],
        });
        if (!cast) {
            cast = castRepo.create({
                name: seed.name,
                role: seed.role,
                image,
            });
        }
        else {
            cast.image = image;
        }
        map.set(seed.name, await castRepo.save(cast));
    }
    return map;
}
async function seedTheatresAndScreens(theatreRepo, screenRepo, screenSeatTypeRepo, seatTypeMap) {
    const screenReferences = [];
    for (const theatreSeed of theatreSeeds) {
        let theatre = await theatreRepo.findOne({
            where: {
                location: theatreSeed.location,
                city: theatreSeed.city,
            },
            relations: ["screens"],
        });
        if (!theatre) {
            theatre = theatreRepo.create({
                name: theatreSeed.name,
                location: theatreSeed.location,
                region: theatreSeed.region,
                city: theatreSeed.city,
                phoneNo: theatreSeed.phoneNo,
                totalScreens: 0,
                active: true,
            });
        }
        else {
            theatre.name = theatreSeed.name;
            theatre.region = theatreSeed.region;
            theatre.city = theatreSeed.city;
            theatre.phoneNo = theatreSeed.phoneNo;
            theatre.active = true;
        }
        theatre = await theatreRepo.save(theatre);
        for (const screenSeed of theatreSeed.screens) {
            const capacity = SCREEN_ROWS * SCREEN_COLS - screenSeed.disabledSeats.length;
            let screen = await screenRepo.findOne({
                where: {
                    name: screenSeed.name,
                    theatre: { id: theatre.id },
                },
                relations: ["seatTypes", "seatTypes.seatType"],
            });
            if (!screen) {
                screen = screenRepo.create({
                    name: screenSeed.name,
                    capacity,
                    rows: SCREEN_ROWS,
                    cols: SCREEN_COLS,
                    type: screenSeed.type,
                    active: true,
                    multiplier: screenSeed.multiplier,
                    disabledSeats: screenSeed.disabledSeats,
                    aisles: screenSeed.aisles,
                    createdAt: new Date(),
                    updatedAt: null,
                    theatre,
                });
            }
            else {
                screen.capacity = capacity;
                screen.rows = SCREEN_ROWS;
                screen.cols = SCREEN_COLS;
                screen.type = screenSeed.type;
                screen.active = true;
                screen.multiplier = screenSeed.multiplier;
                screen.disabledSeats = screenSeed.disabledSeats;
                screen.aisles = screenSeed.aisles;
                screen.updatedAt = new Date();
                screen.theatre = theatre;
            }
            screen = await screenRepo.save(screen);
            await syncScreenSeatTypes(screenSeatTypeRepo, screen, screenSeed.disabledSeats, seatTypeMap);
            screenReferences.push({
                key: `${theatre.location}::${screen.name}`,
                theatre,
                screen,
            });
        }
        theatre.totalScreens = theatreSeed.screens.length;
        await theatreRepo.save(theatre);
    }
    return screenReferences;
}
async function syncScreenSeatTypes(screenSeatTypeRepo, screen, disabledSeats, seatTypeMap) {
    const seatAssignments = buildSeatAssignments(disabledSeats);
    const existing = await screenSeatTypeRepo.find({
        where: { screen: { id: screen.id } },
        relations: ["seatType"],
    });
    const existingBySeatTypeId = new Map(existing.map((item) => [item.seatType.id, item]));
    for (const seatTypeName of SEAT_TYPE_NAMES) {
        const seatType = seatTypeMap.get(seatTypeName);
        if (!seatType) {
            continue;
        }
        const current = existingBySeatTypeId.get(seatType.id);
        const record = current ??
            screenSeatTypeRepo.create({
                screen,
                seatType,
            });
        record.screen = screen;
        record.seatType = seatType;
        record.seatList = seatAssignments[seatTypeName];
        await screenSeatTypeRepo.save(record);
        existingBySeatTypeId.delete(seatType.id);
    }
    for (const stale of existingBySeatTypeId.values()) {
        await screenSeatTypeRepo.remove(stale);
    }
}
async function clearSeedSchedules(seededTitles, movieRepo, scheduleRepo, scheduleSeatTypeRepo) {
    const movies = await movieRepo.find({
        where: { title: (0, typeorm_1.In)(seededTitles) },
    });
    if (!movies.length) {
        return;
    }
    const schedules = await scheduleRepo.find({
        where: {
            movie: { id: (0, typeorm_1.In)(movies.map((movie) => movie.id)) },
        },
        relations: ["bookings"],
    });
    const protectedSchedules = schedules.filter((schedule) => schedule.bookings?.length > 0);
    if (protectedSchedules.length) {
        throw new Error(`Cannot reseed schedules because ${protectedSchedules.length} seeded schedules already have bookings.`);
    }
    if (!schedules.length) {
        return;
    }
    const scheduleIds = schedules.map((schedule) => schedule.id);
    const seatTypes = await scheduleSeatTypeRepo.find({
        where: {
            schedule: { id: (0, typeorm_1.In)(scheduleIds) },
        },
    });
    if (seatTypes.length) {
        await scheduleSeatTypeRepo.remove(seatTypes);
    }
    await scheduleRepo.remove(schedules);
}
async function seedMovies(movieRepo, imageRepo, genreMap, castMap) {
    const map = new Map();
    for (let index = 0; index < movieSeeds.length; index += 1) {
        const seed = movieSeeds[index];
        const [posterBg, posterFg] = movieThemes[index];
        const slug = slugify(seed.title);
        const poster = await upsertImage(imageRepo, buildImageUrl(seed.title, "Poster", posterBg, posterFg, 600, 900));
        const photos = await Promise.all(["Scene 1", "Scene 2", "Scene 3"].map((label, photoIndex) => upsertImage(imageRepo, buildImageUrl(`${seed.title} ${label}`, `Gallery ${photoIndex + 1}`, posterFg, posterBg, 1280, 720))));
        const genres = seed.genres.map((name) => {
            const genre = genreMap.get(name);
            if (!genre) {
                throw new Error(`Missing genre '${name}' for movie '${seed.title}'.`);
            }
            return genre;
        });
        const casts = seed.casts.map((name) => {
            const cast = castMap.get(name);
            if (!cast) {
                throw new Error(`Missing cast '${name}' for movie '${seed.title}'.`);
            }
            return cast;
        });
        let movie = await movieRepo.findOne({
            where: { title: seed.title },
            relations: ["poster", "photos"],
        });
        if (!movie) {
            movie = movieRepo.create({
                title: seed.title,
                createdAt: new Date(),
            });
        }
        movie.description = seed.description;
        movie.duration = seed.duration;
        movie.language = seed.language;
        movie.subtitle = seed.subtitle;
        movie.experience = seed.experience;
        movie.trailerId = seed.trailerId || slug;
        movie.poster = poster;
        movie.photos = photos;
        movie.rating = 0;
        movie.updatedAt = movie.id ? new Date() : null;
        movie.releaseDate =
            seed.statusGroup === "comingSoon"
                ? (0, dayjs_1.default)()
                    .add(7 + index, "day")
                    .toDate()
                : (0, dayjs_1.default)().toDate();
        movie.status =
            seed.statusGroup === "comingSoon"
                ? MovieType_1.MovieStatus.comingSoon
                : MovieType_1.MovieStatus.ticketAvailable;
        movie = await movieRepo.save(movie);
        await syncMovieRelations(movieRepo, movie.id, "genres", genres.map((genre) => genre.id));
        await syncMovieRelations(movieRepo, movie.id, "casts", casts.map((cast) => cast.id));
        map.set(seed.title, movie);
    }
    return map;
}
async function syncMovieRelations(movieRepo, movieId, relation, nextIds) {
    if (relation === "casts") {
        await movieRepo.query("DELETE FROM cast_movies_movie WHERE movieId = ?", [
            movieId,
        ]);
        await movieRepo.query("DELETE FROM movie_casts_cast WHERE movieId = ?", [
            movieId,
        ]);
        if (nextIds.length) {
            const valuesSql = nextIds.map(() => "(?, ?)").join(", ");
            const params = nextIds.flatMap((castId) => [castId, movieId]);
            await movieRepo.query(`INSERT INTO cast_movies_movie (castId, movieId) VALUES ${valuesSql}`, params);
            const reverseParams = nextIds.flatMap((castId) => [movieId, castId]);
            await movieRepo.query(`INSERT INTO movie_casts_cast (movieId, castId) VALUES ${valuesSql}`, reverseParams);
        }
        return;
    }
    const relationQuery = movieRepo
        .createQueryBuilder()
        .relation(Movie_1.Movie, relation)
        .of(movieId);
    const current = (await relationQuery.loadMany());
    const currentIds = current.map((item) => item.id);
    if (currentIds.length) {
        await relationQuery.remove(currentIds);
    }
    if (nextIds.length) {
        await relationQuery.add(nextIds);
    }
}
async function seedSchedules(movieMap, screenReferences, seatTypeMap, scheduleRepo, scheduleSeatTypeRepo) {
    const usedSlots = new Set();
    const nowShowingMovies = movieSeeds.filter((movie) => movie.statusGroup === "nowShowing");
    const ticketAvailableMovies = movieSeeds.filter((movie) => movie.statusGroup === "ticketAvailable");
    for (let index = 0; index < nowShowingMovies.length; index += 1) {
        const movieSeed = nowShowingMovies[index];
        const movie = movieMap.get(movieSeed.title);
        if (!movie) {
            continue;
        }
        const plans = [
            allocateSlot(screenReferences, usedSlots, [0], [
                index % screenReferences.length,
                (index + 1) % screenReferences.length,
            ], buildTodayTimeCandidates(index), getScheduleMultiplier(movieSeed.experience)),
            allocateSlot(screenReferences, usedSlots, [1 + (index % 2), 2 + (index % 3)], [
                (index + 2) % screenReferences.length,
                (index + 3) % screenReferences.length,
            ], ["13:00:00", "16:15:00", "19:30:00", "21:45:00"], getScheduleMultiplier(movieSeed.experience)),
        ];
        await persistSchedulesForMovie(movie, plans, movieSeed, seatTypeMap, scheduleRepo, scheduleSeatTypeRepo);
    }
    for (let index = 0; index < ticketAvailableMovies.length; index += 1) {
        const movieSeed = ticketAvailableMovies[index];
        const movie = movieMap.get(movieSeed.title);
        if (!movie) {
            continue;
        }
        const plans = [
            allocateSlot(screenReferences, usedSlots, [1 + (index % 3), 2 + (index % 4)], [
                index % screenReferences.length,
                (index + 4) % screenReferences.length,
            ], ["10:30:00", "13:45:00", "17:00:00", "20:15:00"], getScheduleMultiplier(movieSeed.experience)),
            allocateSlot(screenReferences, usedSlots, [4 + (index % 4), 6 + (index % 3)], [
                (index + 2) % screenReferences.length,
                (index + 5) % screenReferences.length,
            ], ["11:15:00", "14:30:00", "18:00:00", "21:00:00"], getScheduleMultiplier(movieSeed.experience)),
        ];
        await persistSchedulesForMovie(movie, plans, movieSeed, seatTypeMap, scheduleRepo, scheduleSeatTypeRepo);
    }
}
async function persistSchedulesForMovie(movie, plans, movieSeed, seatTypeMap, scheduleRepo, scheduleSeatTypeRepo) {
    for (const plan of plans) {
        const schedule = scheduleRepo.create({
            movie,
            theatre: plan.theatre,
            screen: plan.screen,
            showDate: plan.showDate,
            showTime: plan.showTime,
            multiplier: plan.multiplier,
            availableSeats: plan.screen.capacity,
            bookedSeats: [],
            status: resolveScheduleStatus(plan.showDate, plan.showTime, movie.duration),
            language: movieSeed.language[0],
            subtitle: movieSeed.subtitle[0] ?? "",
        });
        const savedSchedule = await scheduleRepo.save(schedule);
        await syncScheduleSeatTypes(savedSchedule, plan.screen, seatTypeMap, scheduleSeatTypeRepo);
    }
}
async function syncScheduleSeatTypes(schedule, screen, seatTypeMap, scheduleSeatTypeRepo) {
    for (const seatTypeName of SEAT_TYPE_NAMES) {
        const seatType = seatTypeMap.get(seatTypeName);
        if (!seatType) {
            continue;
        }
        await scheduleSeatTypeRepo.save(scheduleSeatTypeRepo.create({
            schedule,
            seatType,
            price: toMoney(Number(seatType.price) *
                Number(screen.multiplier) *
                Number(schedule.multiplier)),
        }));
    }
}
async function refreshDerivedCounts(genreRepo, theatreRepo, movieRepo, screenRepo) {
    const genres = await genreRepo.find();
    for (const genre of genres) {
        const movieCount = await movieRepo
            .createQueryBuilder("movie")
            .innerJoin("movie.genres", "genre")
            .where("genre.id = :genreId", { genreId: genre.id })
            .getCount();
        genre.movieCount = movieCount;
    }
    await genreRepo.save(genres);
    const theatres = await theatreRepo.find();
    for (const theatre of theatres) {
        theatre.totalScreens = await screenRepo.count({
            where: {
                theatre: { id: theatre.id },
            },
        });
    }
    await theatreRepo.save(theatres);
}
async function refreshMovieStatuses(movieRepo) {
    const seededMovies = await movieRepo.find({
        where: { title: (0, typeorm_1.In)(movieSeeds.map((movie) => movie.title)) },
        relations: ["schedules"],
    });
    const releaseDateOverrides = new Map(movieSeeds
        .filter((movie) => movie.statusGroup === "comingSoon")
        .map((movie, index) => [
        movie.title,
        (0, dayjs_1.default)()
            .add(14 + index, "day")
            .toDate(),
    ]));
    for (const movie of seededMovies) {
        if (movie.schedules?.length) {
            const earliestShow = movie.schedules
                .map((schedule) => (0, dayjs_1.default)(schedule.showDate))
                .sort((left, right) => left.valueOf() - right.valueOf())[0];
            movie.releaseDate = earliestShow.toDate();
        }
        else {
            movie.releaseDate =
                releaseDateOverrides.get(movie.title) ??
                    (0, dayjs_1.default)().add(21, "day").toDate();
        }
        movie.status = resolveMovieStatus(movie);
    }
    await movieRepo.save(seededMovies);
}
async function buildSummary(movieRepo, theatreRepo, screenRepo, scheduleRepo) {
    const seededTitles = movieSeeds.map((movie) => movie.title);
    const seededMovies = await movieRepo.find({
        where: { title: (0, typeorm_1.In)(seededTitles) },
        relations: ["schedules"],
    });
    const theatres = await theatreRepo.find();
    const screens = await screenRepo.find();
    const schedules = await scheduleRepo.find({
        where: { movie: { title: (0, typeorm_1.In)(seededTitles) } },
        relations: ["movie", "theatre", "screen"],
    });
    const statusBreakdown = seededMovies.reduce((acc, movie) => {
        acc[movie.status] = (acc[movie.status] ?? 0) + 1;
        return acc;
    }, {});
    return {
        seededMovies: seededMovies.length,
        statusBreakdown,
        seededSchedules: schedules.length,
        totalMoviesInDatabase: await movieRepo.count(),
        totalBranchesInDatabase: theatres.length,
        totalScreensInDatabase: screens.length,
        sampleSchedulePreview: schedules.slice(0, 5).map((schedule) => ({
            movie: schedule.movie.title,
            branch: schedule.theatre.location,
            screen: schedule.screen.name,
            showDate: schedule.showDate,
            showTime: schedule.showTime,
            status: schedule.status,
        })),
    };
}
function buildTodayTimeCandidates(index) {
    const now = (0, dayjs_1.default)();
    const candidate = now
        .add(2 + Math.floor(index / 2), "hour")
        .minute((index % 4) * 10)
        .second(0);
    if (candidate.isSame(now, "day")) {
        return [candidate.format("HH:mm:ss"), "18:30:00", "21:30:00"];
    }
    return ["18:30:00", "21:30:00", "23:15:00"];
}
function allocateSlot(screenReferences, usedSlots, dayOffsets, screenIndexes, times, multiplier) {
    for (const dayOffset of dayOffsets) {
        const showDate = (0, dayjs_1.default)().add(dayOffset, "day").format("YYYY-MM-DD");
        for (const screenIndex of screenIndexes) {
            const reference = screenReferences[screenIndex];
            for (const time of times) {
                const key = `${reference.key}|${showDate}|${time}`;
                if (!usedSlots.has(key)) {
                    usedSlots.add(key);
                    return {
                        theatre: reference.theatre,
                        screen: reference.screen,
                        showDate,
                        showTime: time,
                        multiplier,
                    };
                }
            }
        }
    }
    throw new Error("Unable to allocate a unique schedule slot for the seeded dataset.");
}
function buildSeatAssignments(disabledSeats) {
    const disabled = new Set(disabledSeats);
    const assignments = {
        Standard: [],
        Prime: [],
        Recliner: [],
    };
    for (let rowIndex = 0; rowIndex < SCREEN_ROWS; rowIndex += 1) {
        const rowLabel = String.fromCharCode(65 + rowIndex);
        const seatTypeName = rowIndex <= 3 ? "Standard" : rowIndex <= 5 ? "Prime" : "Recliner";
        for (let colIndex = 1; colIndex <= SCREEN_COLS; colIndex += 1) {
            const seatId = `${rowLabel}${colIndex}`;
            if (!disabled.has(seatId)) {
                assignments[seatTypeName].push(seatId);
            }
        }
    }
    return assignments;
}
function getScheduleMultiplier(experience) {
    if (experience.includes("IMAX")) {
        return 1.25;
    }
    if (experience.includes("3D")) {
        return 1.1;
    }
    return 1.0;
}
function resolveScheduleStatus(showDate, showTime, duration) {
    const now = (0, dayjs_1.default)();
    const start = (0, dayjs_1.default)(`${showDate} ${showTime}`);
    const end = start.add(parseInt(duration, 10), "minute");
    if (now.isAfter(end)) {
        return ScheduleType_1.ScheduleStatus.completed;
    }
    if (now.isAfter(start.subtract(15, "minute")) && now.isBefore(end)) {
        return ScheduleType_1.ScheduleStatus.ongoing;
    }
    return ScheduleType_1.ScheduleStatus.active;
}
function resolveMovieStatus(movie) {
    const today = (0, dayjs_1.default)();
    if (!movie.schedules?.length) {
        return MovieType_1.MovieStatus.comingSoon;
    }
    const showDates = movie.schedules.map((schedule) => (0, dayjs_1.default)(schedule.showDate));
    const hasToday = showDates.some((date) => date.isSame(today, "day"));
    const hasFuture = showDates.some((date) => date.isAfter(today, "day"));
    const hasPast = showDates.some((date) => date.isBefore(today, "day"));
    if (hasToday) {
        return MovieType_1.MovieStatus.nowShowing;
    }
    if (hasFuture) {
        return MovieType_1.MovieStatus.ticketAvailable;
    }
    if (hasPast) {
        return MovieType_1.MovieStatus.ended;
    }
    return MovieType_1.MovieStatus.comingSoon;
}
async function upsertImage(repo, url) {
    let image = await repo.findOne({ where: { url } });
    if (!image) {
        image = repo.create({ url });
        image = await repo.save(image);
    }
    return image;
}
function buildImageUrl(title, label, bgColor, fgColor, width, height) {
    return `https://placehold.co/${width}x${height}/${bgColor}/${fgColor}/png?text=${encodeURIComponent(`${title} ${label}`)}`;
}
function slugify(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
function toMoney(value) {
    return Number(value.toFixed(2));
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=seedCinemaShowcaseData.js.map