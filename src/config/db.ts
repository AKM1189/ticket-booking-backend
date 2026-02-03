import { AppDataSource } from "../data-source";

let initialized = false;

export const initializeDB = async () => {
  if (!initialized) {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("✅ Database connected");
    }
    initialized = true;
  }
};
