"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("./data-source");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
dotenv_1.default.config();
data_source_1.AppDataSource.initialize()
    .then(async () => {
    const app = (0, express_1.default)();
    const options = {
        origin: "http://localhost:5175",
    };
    app.use((0, cors_1.default)(options));
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: false }));
    app.use((0, cookie_parser_1.default)());
    app.use("/api/auth", authRoutes_1.default);
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT} `);
    });
    // const user = new User()
    // user.firstName = "Timber"
    // user.lastName = "Saw"
    // user.age = 25
    // await AppDataSource.manager.save(user)
    // console.log("Saved a new user with id: " + user.id)
    // console.log("Loading users from the database...")
    // const users = await AppDataSource.manager.find(User)
    // console.log("Loaded users: ", users)
    // console.log("Here you can setup and run express / fastify / any other framework.")
})
    .catch((error) => console.log(error));
//# sourceMappingURL=index.js.map