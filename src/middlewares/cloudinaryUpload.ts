import { Readable } from "stream";
import cloudinary from "../config/cloudinary";
import { randomUUID } from "crypto";

// export function uploadImage(file: Express.Multer.File): Promise<string> {
//   const publicId = `movies/${uuid()}`;

//   return new Promise((resolve, reject) => {
//     const uploadStream = cloudinary.uploader.upload_stream(
//       {
//         public_id: publicId,
//         folder: "movies",
//         resource_type: "image",
//       },
//       (error, result) => {
//         if (error) return reject(error);
//         if (result) resolve(result.public_id);
//       },
//     );

//     Readable.from(file.buffer).pipe(uploadStream);
//   });
// }

export async function uploadImage(file: Express.Multer.File): Promise<string> {
  if (!file?.buffer) throw new Error("No file provided");

  const publicId = `movies/${randomUUID()}`;

  // Convert buffer to base64 Data URI
  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    public_id: publicId,
    folder: "movies",
    resource_type: "image",
  });

  return result.public_id;
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

/**
 * Optional helper: get public URL
 */
export function getPublicUrl(publicId: string, options?: any): string {
  return cloudinary.url(publicId, {
    secure: true,
    ...options,
  });
}
