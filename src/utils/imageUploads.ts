import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import { existsSync, promises as fs } from "fs";
import path from "path";
import { MulterFile } from "../types/multer";
import { constants as fsConstants } from "fs";
// Use Express.Multer.File type for Multer files

const imgbbAPIKey = process.env.IMGBB_API_KEY as string;

if (!imgbbAPIKey) {
  throw new Error("IMGBB_API_KEY is not set in environment variables.");
}

/**
 * Uploads image files to imgbb and returns their URLs.
 * @param files - Array of Multer file objects
 * @returns Array of uploaded image URLs
 */
export const uploadImagesToServer = async (
  files: MulterFile[],
): Promise<{ url: string; deleteUrl: string }[]> => {
  const uploadPromises = files.map(async (file) => {
    const base64Image = await fs.readFile(file.path, { encoding: "base64" });

    const formData = new URLSearchParams();
    formData.append("image", base64Image);

    const response = await axios.post(
      "https://api.imgbb.com/1/upload",
      formData,
      {
        params: { key: imgbbAPIKey },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    );

    // Safely delete the file after upload
    try {
      await fs.access(file.path, fsConstants.F_OK);
      await fs.unlink(file.path);
    } catch (err: any) {
      if (err.code !== "ENOENT") {
        console.error("Error deleting file:", err);
        throw err;
      } else {
        console.warn("File already deleted:", file.path);
      }
    }

    return {
      url: response.data.data.url,
      deleteUrl: response.data.data.delete_url,
    };
  });

  return await Promise.all(uploadPromises);
};
