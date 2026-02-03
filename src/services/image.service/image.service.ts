import { deleteFromR2, uploadToR2 } from "../../config/r2-upload";

export class ImageService {
  async uploadOne(file: Express.Multer.File, folder: string) {
    const key = `${folder}/${Date.now()}-${file.originalname}`;
    await uploadToR2(file, key);
    return key;
  }

  async uploadMany(files: Express.Multer.File[], folder: string) {
    return Promise.all(
      files.map(async (file) => {
        const key = `${folder}/${Date.now()}-${file.originalname}`;
        await uploadToR2(file, key);
        return key;
      }),
    );
  }

  async delete(key: string | string[]) {
    if (Array.isArray(key)) {
      await Promise.all(key.map(deleteFromR2));
    } else {
      await deleteFromR2(key);
    }
  }
}
