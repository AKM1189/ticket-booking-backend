import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import movieRoutes from "./routes/movieRoutes";
import genreRoutes from "./routes/genreRoutes";
import cookieParser from "cookie-parser";
dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

AppDataSource.initialize()
  .then(async () => {
    const app = express();

    const options = {
      origin: "http://localhost:5176",
      credentials: true,
    };

    app.use(cors(options));

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());

    app.use("/api/auth/", authRoutes);
    app.use("/api/admin/", movieRoutes);
    app.use("/api/admin/", genreRoutes);

    /////
    //only for local
    // if (process.env.NODE_ENV !== "production") {
    //   app.listen(process.env.PORT, () => {
    //     console.log(`Server is running on port ${process.env.PORT} `);
    //   });
    // }
    //////

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
