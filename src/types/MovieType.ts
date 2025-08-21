import { MulterFile } from "./multer";

export type MovieType = {
  title: string;
  description: string;
  duration: string;
  language: string[];
  subtitle: string[];
  releaseDate: Date;
  status: string;
  poster: MulterFile;
  trailerId: string;
  photos: MulterFile[];
  experience: string[];
  genres: number[];
  casts: number[];
};
