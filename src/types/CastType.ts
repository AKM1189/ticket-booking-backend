import { MulterFile } from "./multer";

export type CastType = {
  id: number;
  name: string;
  role: string;
  imageUrl: MulterFile;
};
